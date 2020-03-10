import {JsonController, Get, CurrentUser, Authorized, Body, Put, OnUndefined} from "routing-controllers";
import winston, { Logger } from "winston";
import { User } from "../models/User";
import Container from "typedi";
import { TransactionRequestService } from "../services/TransactionRequestService";
import { TransactionRequest } from "../models/TransactionRequest";

@JsonController("/api/transactions")
export class TransactionRequestController {
    log: Logger;
    constructor() {
        this.log = winston.createLogger({
            transports: [
                new winston.transports.Console()
                ]
        });
    }

    @Authorized()
    @Get("/")
    getMyTransactionRequests(@CurrentUser() user: User): Promise<TransactionRequest[]> {
        return Container.get(TransactionRequestService).findRequestsToUser(user);
    }

    @Authorized()
    @OnUndefined(400)
    @Put("/pay")
    async payTransactionRequest(@CurrentUser() user: User, @Body() body: TransactionRequest): Promise<TransactionRequest> {
        const trService = Container.get(TransactionRequestService);
        if (!trService.isPaymentUnique(body.transactionHash)) {
            return undefined;
        }
        let tr = new TransactionRequest();
        tr.transactionHash = body.transactionHash;
        await trService.update(body.id, tr);
        tr = await trService.findOne(tr.id);
        if (tr.validatePayment()) {
            tr.paid = true;
            return Container.get(TransactionRequestService).update(body.id, tr);
        }
        return tr;
    }
}