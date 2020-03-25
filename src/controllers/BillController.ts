import Container from "typedi";
import {JsonController, Get, CurrentUser, Authorized, Post, Body, Delete, OnUndefined} from "routing-controllers";
import { Bill } from "../models/Bill";
import { User } from "../models/User";
import { BillService } from "../services/BillService";
import { LoggerService } from "../services/LoggerService";
import { BillWeight } from "../models/BillWeight";
import Joi from "@hapi/joi";

class AddBillRequest {
    description: string;
    participants: string[];
    totalXrp: number;
    weights: number[];
}

const addBillReqestSchema = Joi.object({
    description: Joi.string().max(1000).required(),
    participants: Joi.array().items(
        Joi.string().max(1000).required()
    ).required()
});

@JsonController("/api/bills")
export class BillController {

    log = Container.get(LoggerService);

    @Authorized()
    @Get("/")
    getMyBills(@CurrentUser() user: User): Promise<Bill[]> {
        return Container.get(BillService).findUserBills(user);
    }

    @Authorized()
    @Delete("/")
    async deleteMyBills(@CurrentUser() user: User): Promise<string> {
        await Container.get(BillService).deleteUserBills(user);
        return "Success";
    }

    @Authorized()
    @OnUndefined(400)
    @Post("/")
    addBill(@CurrentUser() user: User, @Body() body: AddBillRequest): Promise<Bill> {
        const bill = new Bill();
        bill.creditor = user;
        bill.description = body.description;
        bill.totalXrpDrops = body.totalXrpDrops;
        bill.participants = [];
        bill.weights = [];

        if (body.participants.length !== body.weights.length) {
            return undefined;
        }

        for (let i = 0; i < body.participants.length; i++) {
            const part = new User();
            part.username = body.participants[i];
            bill.participants.push(part);
            const weight = new BillWeight();
            weight.user = part;
            weight.bill = bill;
            weight.weight = body.weights[i];
            bill.weights.push(weight);
          }
        return Container.get(BillService).create(bill);
    }
}

