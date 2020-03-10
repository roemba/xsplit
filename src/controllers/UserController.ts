import { Container } from "typedi";
import {Controller, Param, Get, Post, Put, Delete, Req, UseBefore} from "routing-controllers";
import { UserService } from "../services/UserService";
import { User } from '../models/User';
import {Request} from "express";
import {json} from "body-parser";
import { LoggerService } from "../services/LoggerService";

@Controller("/api/users")
export class UserController {
  
  log = Container.get(LoggerService);

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
