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
import { deriveAddress } from 'ripple-keypairs';
import { BillService } from "../services/BillService";
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
   async GetBillOverview(@CurrentUser() user: User): Promise<unknown> {

      const unsettledBills = await Container.get(BillService).findUserUnsettledBills(user);
      const settledBills = await Container.get(BillService).findUserSettledBills(user);

      const unsettledBillsArray = Array<object>();
      const settledBillsArray = Array<object>();

      for(const bill of unsettledBills) {

         const transactions = Array<object>();
         for(const tr of bill.transactionRequests) {
            const weight = bill.weights.filter(w => w.user.username === tr.debtor.username)[0];

            transactions.push({
               id: tr.id,
               paid: tr.paid,
               debtor: tr.debtor.username,
               weight: weight.weight
            });
         }

         unsettledBillsArray.push({
            id: bill.id,
            description: bill.description,
            dateCreated: bill.dateCreated,
            totalXrp: XRPUtil.dropsToXRP(bill.totalXrpDrops),
            creditor: bill.creditor.username,
            transactions: transactions
         });
      }

      for(const bill of settledBills) {

         const transactions = Array<object>();
         for(const tr of bill.transactionRequests) {
            const weight = bill.weights.filter(w => w.user.username === tr.debtor.username)[0];

            transactions.push({
               id: tr.id,
               paid: tr.paid,
               debtor: tr.debtor.username,
               weight: weight.weight
            });
         }

         settledBillsArray.push({
            id: bill.id,
            description: bill.description,
            dateCreated: bill.dateCreated,
            totalXrp: XRPUtil.dropsToXRP(bill.totalXrpDrops),
            creditor: bill.creditor.username,
            transactions: transactions
         });
      }

      return {page: "bills", settledBills: settledBillsArray, unsettledBills: unsettledBillsArray};
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
