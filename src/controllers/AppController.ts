import {JsonController, Param, Body, Get, Post, Put, Delete, Render, Res, Req} from "routing-controllers";
import { Container } from "typedi";
import { UserService } from "../services/UserService";
import winston, { Logger } from "winston";
import { RippleLibService } from "../services/RippleLibService";
import { User } from "../models/User";
import { GetServerInfoResponse } from "ripple-lib/dist/npm/common/serverinfo";

@JsonController()
export class AppController {
   log: Logger;
   constructor() {
      this.log = winston.createLogger({
          transports: [
              new winston.transports.Console()
            ]
      });
  }
   @Get("")
   getAll(): Promise<GetServerInfoResponse> {
      return Container.get(RippleLibService).getServerInfo();
   }

   @Get("/users")
   getAllUsers(): Promise<User[]> {
      return Container.get(UserService).find();
    }

    @Get("/ejs/:id")
    @Render("index.ejs")
    getEJSView(@Param("id") id: number) {
       return {id};
    }

    @Get("/users/:id")
    getOne(@Param("id") id: String) {
       return "This action returns user #" + id;
    }

    @Post("/users")
    post(@Body() thing: any) {
       return "Posting thing...";
    }

    @Put("/users/:id")
    put(@Param("id") id: number, @Body() thing: any) {
       return "Updating a thing...";
    }

    @Delete("/users/:id")
    remove(@Param("id") id: number) {
       return "Deleting thing...";
    }

}