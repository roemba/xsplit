import {Controller, Get, Param, Redirect, Render} from "routing-controllers";
import winston, {Logger} from "winston";

@Controller() 
export class RouteController {
   log: Logger;
   constructor() {
      this.log = winston.createLogger({
         transports: [
            new winston.transports.Console()
         ]
      });
   }

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

   @Get("/404")
   @Render("index.ejs")
   Get404(): unknown {
      return {page: "404"};
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

   @Get("/account")
   // @Authorized()
   @Render("index.ejs")
   GetAccount(): unknown {
      return {page: "account"};
   }

   @Get("/pay")
   // @Authorized()
   @Render("index.ejs")
   GetPay(): unknown {
      const payments = [{receiver: "johndoe", amount: 384, subject: "Lunch at EWI"},{receiver: "Piet", amount: 112, subject: "Coffee"}];
      return {page: "pay", payments: payments};
   }

   @Get("/request")
   // @Authorized()
   @Render("index.ejs")
   GetRequest(): object {
      return {page: "request"};
   }

   @Get("/request/:username")
   // @Authorized()
   @Render("index.ejs")
   GetRequestFromFriend(@Param("username") username: string): unknown {
      return {page: "request", username: username, friends: ""};
   }

   @Get("/lists/:id")
   @Render("index.ejs")
   GetList(@Param("id") id: number): unknown {
      const users = [{name: "alice",balance: 10.12, polarity: '+'},{name: "bob",balance: 11.97, polarity: '+'},{name: "joost",balance: 33.74, polarity: '-'},{name: "piet",balance: 8.43, polarity: '+'},{name: "henk",balance: 3.47, polarity: '+'},{name: "marie",balance: 0.25, polarity: '+'}];
      return {page: "list", id: id, users: users};
   }

   @Get("/lists")
   @Render("index.ejs")
   GetLists(): object {
      const lists = [{name: "XSPLIT Development Team", id: 1, balance: 10.99, balancePolarity: '+'},{name: "Sport Team", id: 2, balance: 23.78, balancePolarity: '-'},{name: "Friends", id: 3, balance: 0.00, balancePolarity: ''}];
      return {page: "lists", lists: lists};
   }

}