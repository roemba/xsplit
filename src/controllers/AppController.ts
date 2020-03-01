import {JsonController, Param, Body, Get, Post, Put, Delete} from "routing-controllers";
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
    userLogin(@Body() id: string): Promise<string | Array<string>> {
      this.log.info("id " + id);
      return Container.get(UserService).getPublicKey(id);
    }

    @Get("/users/:id")
    getOne(@Param("id") id: string): Promise<User | undefined> {
      return Container.get(UserService).findOne(id);
    }

    @Post("/users")
    post(@Body() user: User): Promise<User | Array<string>> {
      // get information from the body and convert it to json
      this.log.info(user.username + " " + user.publickey);
      return Container.get(UserService).create(user);
    }

    @Put("/users/:id")
    put(@Param("id") id: string): string {
       return "Updating the user " + id;
    }

    @Delete("/users/:id")
    remove(@Param("id") id: string): string {
      return "Deleting user " + id;
    } 
}