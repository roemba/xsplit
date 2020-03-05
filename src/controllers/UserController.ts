import {Controller, Param, Get, Post, Put, Delete, Req, UseBefore} from "routing-controllers";
import winston, { Logger } from "winston";
import { UserService } from "../services/UserService";
import { Container } from "typedi";
import { User } from '../models/User';
import {Request} from "express";
import {json} from "body-parser";

@Controller("/api/users")
export class UserController {
   log: Logger;
   constructor() {
    this.log = winston.createLogger({
        transports: [
            new winston.transports.Console({
                level: 'debug',
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.simple()
                )
            })
        ]
    });
}

    @Get("")
    getAllUsers(): Promise<User[]> {
         return Container.get(UserService).findAll();
    } 

    @Get("/:id")
    getOne(@Param("id") id: string): Promise<User | undefined> {
      return Container.get(UserService).findOne(id);
    }

    @Post("")
    @UseBefore(json())
    post(@Req() request: Request): Promise<User> {
      const user = new User();
      user.username = request.body.username;
      user.email = request.body.email;
      user.fullName = request.body.fullName;
      user.publickey = request.body.publickey;
      return Container.get(UserService).create(user);
    }

    @Put("/:id")
    put(@Param("id") id: string): string {
       return "Updating the user " + id;
    }

    @Delete("/:id")
    remove(@Param("id") id: string): string {
      return "Deleting user " + id;
    } 

}
