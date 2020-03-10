import {Controller, Param, Get, Post, Put, Delete, Req, UseBefore, CurrentUser, Authorized} from "routing-controllers";
import winston, { Logger } from "winston";
import { UserService } from "../services/UserService";
import { Container } from "typedi";
import { User } from '../models/User';
import {Request} from "express";
import {json} from "body-parser";
import 'babel-polyfill';
import * as brandedQRCode from 'branded-qr-code';
import path from "path";

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
    @Authorized()
    getMe(@CurrentUser() user: User): Promise<User | undefined> {
        return Container.get(UserService).findMe(user);
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