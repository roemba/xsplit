import {Controller, Get, Param, Redirect, Render} from "routing-controllers";
import winston, {Logger} from "winston";
import {UserService} from "../services/UserService";
import {Container} from "typedi";

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
   async GetRequest(): Promise<object> {
      const friends = await Container.get(UserService).findAll();
      return {page: "request", username: "", friends: friends};
   }

   @Get("/request/:username")
   // @Authorized()
   @Render("index.ejs")
   GetRequestFromFriend(@Param("username") username: string): unknown {
      return {page: "request", username: username, friends: ""};
   }

   @Get("/addfriend")
   @Render("index.ejs")
   GetAddFriend(): unknown {
      return {page: "addfriend", friend: ""};
   }

   @Get("/addfriend/:username")
   @Render("index.ejs")
   GetAddFriendFromQR(@Param("username") username: string): unknown {
      return {page: "addfriend", friend: username};
   }

   @Get("/friends")
   @Render("index.ejs")
   async GetFriends(): Promise<object> {
      const friends = await Container.get(UserService).findAll();

      return {page: "friends", friends: friends};
   }

}