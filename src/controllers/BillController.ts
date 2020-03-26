import Container from "typedi";
import {JsonController, Get, CurrentUser, Authorized, Post, Body, Delete, BadRequestError} from "routing-controllers";
import { Bill } from "../models/Bill";
import { User } from "../models/User";
import { BillService } from "../services/BillService";
import { LoggerService } from "../services/LoggerService";
import { BillWeight } from "../models/BillWeight";
import {MaxLength, IsNotEmpty, IsInt, IsPositive, ArrayNotEmpty, IsString} from "class-validator";

class AddBillRequest {
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    description: string;


    @ArrayNotEmpty()
    @IsString({each: true})
    @MaxLength(1000, {each: true})
    participants: string[];

    @IsInt()
    @IsPositive()
    totalXrpDrops: number;

    @ArrayNotEmpty()
    @IsInt({each: true})
    weights: number[];
}

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
    async addBill(@CurrentUser() user: User, @Body() body: AddBillRequest): Promise<string> {
        const bill = new Bill();
        bill.creditor = user;
        bill.description = body.description;
        bill.totalXrpDrops = body.totalXrpDrops;
        bill.participants = [];
        bill.weights = [];

        if (body.participants.length !== body.weights.length) {
            throw new BadRequestError("Participant length and weight length must match!");
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
        const newBill = await Container.get(BillService).create(bill);
        return `Bill ${newBill.id} created`;
    }
}

