import {JsonController, Get, CurrentUser, Authorized, Post, Body, Delete} from "routing-controllers";
import winston, { Logger } from "winston";
import { Bill } from "../models/Bill";
import { User } from "../models/User";
import Container from "typedi";
import { BillService } from "../services/BillService";

@JsonController("/api/bills")
export class AppController {
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
    @Post("/")
    addBill(@CurrentUser() user: User, @Body() body: Bill): Promise<Bill> {
        const bill = new Bill();
        bill.creditor = user;
        bill.description = body.description;
        bill.totalXrp = body.totalXrp;
        bill.participants = [];
        body.participants.forEach((user: User) => {
            const part = new User();
            part.username = user.username;
            bill.participants.push(part);
        });
        return Container.get(BillService).create(bill);
    }
}