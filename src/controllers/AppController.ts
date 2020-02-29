import {JsonController, Param, Body, Get, Post, Put, Delete, Render} from "routing-controllers";
import { Container } from "typedi";
import { UserService } from "../services/UserService";
import winston, { Logger } from "winston";
import { RippleLibService } from "../services/RippleLibService";
import { User } from '../models/User';
import { GetServerInfoResponse } from "ripple-lib/dist/npm/common/serverinfo";

@JsonController("/api")
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
      return Container.get(UserService).findAll();
   }

    @Get("/login")
    userLogin(@Body() id: any) {
      this.log.info("id " + id.username);
      return Container.get(UserService).getPublicKey(id.username);
    }

    @Get("/users/:id")
    getOne(@Param("id") id: string) {
      return Container.get(UserService).findOne(id);
    }

    @Post("/users")
    post(@Body() user: User) {
      // get information from the body and convert it to json
      this.log.info(user.username + " " + user.publickey);
      return Container.get(UserService).create(user);
    }

    @Put("/users/:id")
    put(@Param("id") id: string, @Body() thing: any) {
       return "Updating the user " + id;
    }

    @Delete("/users/:id")
    remove(@Param("id") id: string) {
      return Container.get(UserService).delete(id);
    } 
}