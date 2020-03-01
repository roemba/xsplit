import {Controller, Param, Body, Get, Post, Put, Delete, Render} from "routing-controllers";
import { Container } from "typedi";
import { UserService } from "../services/UserService";
import winston, { Logger } from "winston";
import { RippleLibService } from "../services/RippleLibService";
import { User } from "../models/User";
import { GetServerInfoResponse } from "ripple-lib/dist/npm/common/serverinfo";

@Controller("")
export class AppController {
   log: Logger;
   constructor() {
      this.log = winston.createLogger({
          transports: [
              new winston.transports.Console()
            ]
      });
  }
   @Get("/api")
   getAll(): Promise<GetServerInfoResponse> {
      return Container.get(RippleLibService).getServerInfo();
   }

   @Get("/users")
   getAllUsers(): Promise<User[]> {
   return Container.get(UserService).find();
   }

   @Get("/web/:page")
   @Render("index.ejs")
   getEJSView(@Param("page") page: string): unknown {
      this.log.info("Go to page " + page)
      return {page};
   }

   @Get("/users/:id")
   getOne(@Param("id") id: number): string {
      return "This action returns user #" + id;
   }

   @Post("/users")
   post(@Body() thing: User): string {
      this.log.info(thing);
      return "Posting thing...";
   }

   @Put("/users/:id")
   put(@Param("id") id: number, @Body() thing: User): string {
      this.log.info("Updating " + id + " " + thing);
      return "Updating a thing...";
   }

   @Delete("/users/:id")
   remove(@Param("id") id: number): string {
      this.log.info("Deleting " + id);
      return "Deleting thing...";
   }

}