import {
   Controller,
   Get,
   Param,
   Redirect,
   Render,
   CurrentUser,
   Authorized,
   ExpressErrorMiddlewareInterface, UnauthorizedError, UseAfter, NotFoundError
} from "routing-controllers";
import { Container } from "typedi";
import { LoggerService } from "../services/LoggerService";
import { TransactionRequestService } from "../services/TransactionRequestService";
import { User } from "../models/User";
import { XRPUtil } from "../util/XRPUtil";
import * as express from 'express';
import { GroupService } from "../services/GroupService";


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
      const transactions = await Container.get(TransactionRequestService).findRequestsToUser(user, {relations: ["bill"]});
      const payments = Array<object>();
      
      for(const transaction of transactions) {
         if(!transaction.paid) {
            const date: Date = new Date(Number(transaction.dateCreated));
            const dateFormatted: string = date.getDate()+"/"+(date.getMonth()+1)+"/"+date.getFullYear();
            const totalXrp = XRPUtil.dropsToXRP(transaction.bill === null ? transaction.totalXrpDrops : transaction.bill.totalXrpDrops);
            const description = transaction.bill === null ? "Group settlement" : transaction.bill.description;
            
            payments.push({
               id: transaction.id, 
               owner: transaction.creditor.username, 
               ownerKey: transaction.creditor.publickey,
               dateCreated: dateFormatted,
               totalXrp, 
               description,
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
      return {page: "request", group: undefined};
   }

   @Authorized()
   @Get("/request/:groupId")
   @Render("index.ejs")
   async GetRequestForGroup(@CurrentUser() user: User, @Param("groupId") groupId: string): Promise<object> {
      const group = await Container.get(GroupService).findOne(groupId, user);
      if (group === undefined) {
         throw new NotFoundError();
      }
      return {page: "request", group};
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
   async GetList(@CurrentUser() user: User, @Param("id") id: string): Promise<object> {
      const group = await Container.get(GroupService).findOne(id, user);
      return {page: "group", group};
   }

   @Authorized()
   @Get("/groups")
   @Render("index.ejs")
   async GetLists(@CurrentUser() user: User): Promise<object> {
      const groups = await Container.get(GroupService).findUserGroups(user);
      return {page: "groups", groups: groups};
   }

}
