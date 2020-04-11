import {
   Controller,
   Get,
   Param,
   Redirect,
   Render,
   CurrentUser,
   Authorized,
   ExpressErrorMiddlewareInterface, UnauthorizedError, UseAfter
} from "routing-controllers";
import { Container } from "typedi";
import { LoggerService } from "../services/LoggerService";
import { TransactionRequestService } from "../services/TransactionRequestService";
import { User } from "../models/User";
import { XRPUtil } from "../util/XRPUtil";
import * as express from 'express';
import { deriveAddress } from 'ripple-keypairs';
import { BillService } from "../services/BillService";

class UnauthorizedHandler implements ExpressErrorMiddlewareInterface {
   error(error: Error, req: express.Request, res: express.Response): void {
      if (error instanceof UnauthorizedError) {
         res.redirect("/login");
         return;
      }
   }

}

@Controller()
@UseAfter(UnauthorizedHandler)
export class RouteController {
   log = Container.get(LoggerService);

   @Get("/")
   @Redirect("/home")
   GetHome2(): unknown {
      return {page: "home"};
   }

   @Get("/home")
   @Render("index.ejs")
   GetHome(): unknown {
      return {page: "home"};
   }

   @Get("/login")
   @Render("index.ejs")
   GetLogin(): unknown {
      return {page: "login"};
   }

   @Get("/register")
   @Render("index.ejs")
   GetRegister(): unknown {
      return {page: "register"};
   }

   @Authorized()
   @Get("/account")
   @Render("index.ejs")
   async getAccount(@CurrentUser() user: User): Promise<unknown> {
      user.publickey = deriveAddress(user.publickey);
      return {page: "account", user: user};
   }


   @Authorized()
   @Get("/pay")
   @Render("index.ejs")
   async GetPay(@CurrentUser() user: User): Promise<unknown> {
      const transactions = await Container.get(TransactionRequestService).findRequestsToUser(user, {relations: ["bill"]});
      const payments = Array<object>();
      
      for(const transaction of transactions) {
         if(!transaction.paid) {
            const date: Date = new Date(Number(transaction.dateCreated));
            const dateFormatted: string = date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear();
            
            payments.push({
               id: transaction.id, 
               owner: transaction.bill.creditor.username, 
               ownerKey: transaction.bill.creditor.publickey,
               dateCreated: dateFormatted,
               totalXrp: XRPUtil.dropsToXRP(transaction.bill.totalXrpDrops), 
               description: transaction.bill.description.toString(),
               debtorXrp: XRPUtil.dropsToXRP(transaction.totalXrpDrops),
               debtorDrops: transaction.totalXrpDrops
            });
         }
      }
      return {page: "pay", payments: payments, rippleServer: process.env.RIPPLE_SERVER};
   }

   @Authorized()
   @Get("/request")
   @Render("index.ejs")
   GetRequest(): object {
      return {page: "request"};
   }

   @Authorized()   
   @Get("/bills")
   @Render("index.ejs")
   async GetBillOverview(@CurrentUser() user: User): Promise<unknown> {

      const bills = await Container.get(BillService).findUserBills(user);

      // return {page: "bills", bills: await bills};
      return {page: "bills", bills: bills};
   }

   @Authorized()
   @Get("/groups/:id")
   @Render("index.ejs")
   GetList(@Param("id") id: number): unknown {
      const users = [{name: "alice",balance: 10.12, polarity: '+'},{name: "bob",balance: 11.97, polarity: '+'},{name: "joost",balance: 33.74, polarity: '-'},{name: "piet",balance: 8.43, polarity: '+'},{name: "henk",balance: 3.47, polarity: '+'},{name: "marie",balance: 0.25, polarity: '+'}];
      return {page: "group", id: id, users: users};
   }

   @Authorized()
   @Get("/groups")
   @Render("index.ejs")
   GetLists(): object {
      const groups = [{name: "XSPLIT Development Team", id: 1, balance: 10.99, balancePolarity: '+'},{name: "Sport Team", id: 2, balance: 23.78, balancePolarity: '-'},{name: "Friends", id: 3, balance: 0.00, balancePolarity: ''}];
      return {page: "groups", groups: groups};
   }

}
