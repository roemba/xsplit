import Container from "typedi";
import {JsonController, Get, CurrentUser, Authorized, Body, Put, OnUndefined, Param} from "routing-controllers";
import { User } from "../models/User";
import { TransactionRequestService } from "../services/TransactionRequestService";
import { TransactionRequest } from "../models/TransactionRequest";
import { LoggerService } from "../services/LoggerService";

@JsonController("/api/transactions")
export class TransactionRequestController {

    log = Container.get(LoggerService);

    @Authorized()
    @Get("/")
    getMyTransactionRequests(@CurrentUser() user: User): Promise<TransactionRequest[]> {
        return Container.get(TransactionRequestService).findRequestsToUser(user);
    }

    @Authorized()
    @OnUndefined(400)
    @Put("/paid/:id")
    async setPayedTransactionRequest(@CurrentUser() user: User, @Param("id") id: string): Promise<TransactionRequest> {
        try {
            return await Container.get(TransactionRequestService).setPaid(user, id);
        } catch {
            this.log.error("Setting TransactionRequest to paid failed");
            return undefined;
        }
    }

    @Authorized()
    @OnUndefined(400)
    @Put("/pay")
    async payTransactionRequest(@CurrentUser() user: User, @Body() body: TransactionRequest): Promise<TransactionRequest> {
        const transactionRequest = await Container.get(TransactionRequestService).findOne(body.id);
        const trService = Container.get(TransactionRequestService);
        if (!trService.isPaymentUnique(transactionRequest.transactionHash)) {
            return undefined;
        }
        let tr = new TransactionRequest();
        tr.transactionHash = transactionRequest.transactionHash;
        await trService.update(body.id, tr);
        tr = await trService.findOne(tr.id, {relations: ["bill"]});
        if (trService.validatePayment(tr)) {
            tr.paid = true;
            return Container.get(TransactionRequestService).update(body.id, tr);
        }
        
        return tr;
    }
}