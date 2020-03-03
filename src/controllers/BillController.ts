import {Controller, Get, CurrentUser, Authorized} from "routing-controllers";
import winston, { Logger } from "winston";
import { Bill } from "../models/Bill";
import { User } from "../models/User";
import Container from "typedi";
import { BillService } from "../services/BillService";

@Controller("/api/bills")
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
}