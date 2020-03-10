import Container from "typedi";
import {JsonController, Get, CurrentUser, Authorized, Post, Body, Delete} from "routing-controllers";
import { Bill } from "../models/Bill";
import { User } from "../models/User";
import { BillService } from "../services/BillService";
import { LoggerService } from "../services/LoggerService";

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