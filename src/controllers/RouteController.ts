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
   GetAccount(): unknown {
      return {page: "account"};
   }


   @Authorized()
   @Get("/pay")
   @Render("index.ejs")
   async GetPay(@CurrentUser() user: User): Promise<unknown> {
      const transactions = await Container.get(TransactionRequestService).findRequestsToUser(user);
      const payments = Array<object>();
      
      for(let transaction of transactions) {
         transaction = await Container.get(TransactionRequestService).findOne(transaction.id, {relations: ["bill"]});
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
   GetBillOverview(): unknown {
      // const bills = [{id: "2130b428-32fa-4909-872b-8d0b010bf174", description: "ASDASDASD", dateCreated: "1584534675889", totalXrp: "124", participants: [{username: "jb", publickey: "02E3EFBF87E8E47CAE93286C600463A051D9DE664204A299D34FFDDA8107904B0A", email: "j.w.bambacht@student.tudelft.nl", fullName: ""},{username: "alice", publickey: "02C90CDEDE88AFD56FF51A41DDF8B12EB0380D3F4D21D2BB6CD15E64FEB25358F6", email: "alice@xsplit.com", fullName: "Alice"},{username: "bob", publickey: "02247DCA3727D848340F1520968A2191D3AC8F1299AFC7291969E6845AC7CFB579", email: "bob@xsplit.com", fullName: "Bob"}]}];
      // return {page: "bills", unsettledbills: bills, settledbills: bills};
      return {page: "bills"};
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
