import { Container } from "typedi";
import { JsonController, Param, Get, Post, Put, Delete, Req, UseBefore, CurrentUser, Authorized, OnUndefined, BadRequestError, Body} from "routing-controllers";
import { UserService } from "../services/UserService";
import { User } from '../models/User';
import {Request} from "express";
import {json} from "body-parser";
import { LoggerService } from "../services/LoggerService";
import 'babel-polyfill';
import * as brandedQRCode from 'branded-qr-code';
import path from "path";

@JsonController("/api/users")
export class UserController {
  
  log = Container.get(LoggerService);

    @Get("")
    @Authorized()
    getMe(@CurrentUser() user: User): Promise<User | undefined> {
        return Container.get(UserService).findMe(user);
    }

    @Get("/search/:searchString")
    getSearchMatch(@Param("searchString") usernameSearch: string): Promise<string[]> {
      return Container.get(UserService).findUsers(usernameSearch);
    }

    @Get("/:id")
    getOne(@Param("id") id: string): Promise<User | undefined> {
      return Container.get(UserService).findOne(id);
    }

    @Post("")
    @OnUndefined(400)
    @UseBefore(json())
    async post(@Req() request: Request): Promise<User> {
      const user = new User();
      user.username = request.body.username;
      user.email = request.body.email;
      user.publickey = request.body.publickey;
      try {
        const newUser = await Container.get(UserService).create(user);
        if(newUser.username === undefined) {
          throw new BadRequestError("Public key and/or username is already in use");
        } else {
          return newUser;
        }
      } catch {
        throw new BadRequestError("Public key and/or username is already in use");
      }
    }

    @Put("")
    @Authorized()
    put(@CurrentUser() user: User, @Body() body: User): string {
      Container.get(UserService).update(body.email, body.fullName, body.notifications, user);
      return "Updating the user";
    }

    @Delete("/:id")
    remove(@Param("id") id: string): string {
      return "Deleting user " + id;
    } 

    @Get("/qr/:username")
    async genQR(@Param("username") username: string): Promise<object> {
      let qr;

      await brandedQRCode.generate({
         text: 'https://localhost:3000/addfriend/'+username, 
         path: path.resolve(__dirname, "../assets/img/xplit-dark.png")
      }).then((buf: unknown) => {
         qr = "data:image/png;base64,"+Buffer.from(buf).toString('base64');
      });

      return {qr: qr};
    }

}