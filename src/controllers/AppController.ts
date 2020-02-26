import {Controller, Param, Body, Get, Post, Put, Delete, Render} from "routing-controllers";
import { Container } from "typedi";
import { UserService } from "../services/UserService";
import winston, { Logger } from "winston";
import { RippleLibService } from "../services/RippleLibService";

@Controller("/api")
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
    getAll() {
       return Container.get(RippleLibService).getServerInfo();
    }

    @Get("/users")
    getAllUsers() {
      return Container.get(UserService).find();
    }

    @Get("/ejs/:id")
    @Render("index.ejs")
    getEJSView(@Param("id") id: number) {
       return {id};
    }

    @Get("/users/:id")
    getOne(@Param("id") id: number) {
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