import Container from "typedi";
import {JsonController, Get, CurrentUser, Authorized, Body, Put, Param, BadRequestError, UnauthorizedError} from "routing-controllers";
import { User } from "../models/User";
import { TransactionRequestService } from "../services/TransactionRequestService";
import { TransactionRequest } from "../models/TransactionRequest";
import { LoggerService } from "../services/LoggerService";
import {IsNotEmpty, IsString, MaxLength} from "class-validator";

class PayTransactionRequestRequest {
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    id: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(2000)
    transactionHash: string;
}

@JsonController("/api/transactions")
export class TransactionRequestController {

    log = Container.get(LoggerService);

    @Authorized()
    @Get("/")
    getMyTransactionRequests(@CurrentUser() user: User): Promise<TransactionRequest[]> {
        return Container.get(TransactionRequestService).findRequestsToUser(user);
    }

    @Authorized()
    @Get("/:id")
    async getTransactionRequest(@CurrentUser() user: User, @Param("id") id: string): Promise<TransactionRequest> {
        const tr = await Container.get(TransactionRequestService).findOne(id, {relations: ["bill"]});
        if (tr.bill.creditor.username === user.username || tr.debtor.username === user.username) {
            return tr;
        } else {
            throw new UnauthorizedError("You are not a creditor or debtor of this transaction request");
        }
    }

    @Authorized()
    @Put("/paid/:id")
    async setPayedTransactionRequest(@CurrentUser() user: User, @Param("id") id: string): Promise<TransactionRequest> {
        try {
            return await Container.get(TransactionRequestService).setPaid(user, id);
        } catch {
            this.log.error("Setting TransactionRequest to paid failed");
            throw new BadRequestError("Setting transaction request to paid failed");
        }
    }

    @Authorized()
    @Put("/pay")
    async payTransactionRequest(@Body() body: PayTransactionRequestRequest): Promise<TransactionRequest> {
        this.log.info("Pay request =>", body);
        const trService = Container.get(TransactionRequestService);
        if (body.transactionHash === undefined || !trService.isPaymentUnique(body.transactionHash)) {
            throw new BadRequestError("Transaction hash undefined or already used");
        }
        let tr = new TransactionRequest();
        tr.transactionHash = body.transactionHash;
        await trService.update(body.id, tr);
        tr = await trService.findOne(tr.id, {relations: ["bill"]});
        if (await trService.validatePayment(tr)) {
            tr.paid = true;
            return Container.get(TransactionRequestService).update(body.id, tr);
        } else {
            throw new BadRequestError("Payment validation failed");
        }
    }
}