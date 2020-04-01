import {Container} from "typedi";
import {
    Authorized,
    BadRequestError,
    Body,
    CurrentUser,
    Delete,
    Get,
    JsonController,
    Param,
    Post,
    Put
} from "routing-controllers";
import {UserService} from "../services/UserService";
import {RippleLibService} from "../services/RippleLibService";
import {User} from '../models/User';
import {LoggerService} from "../services/LoggerService";
import 'babel-polyfill';
import * as brandedQRCode from 'branded-qr-code';
import path from "path";
import {IsBoolean, IsEmail, IsNotEmpty, IsString, MaxLength} from "class-validator";
import fetch from "node-fetch";
import { PrivateInformation } from "../models/PrivateInformation";

class CreateUserRequest {
    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    username: string;

    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    fullName: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(4000)
    publickey: string;
}

class UpdateUserRequest {
    @IsString()
    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(1000)
    fullName: string;

    @IsBoolean()
    notifications: boolean
}

@JsonController("/api/users")
export class UserController {
  
    log = Container.get(LoggerService);

    @Get("")
    @Authorized()
    getMe(@CurrentUser() user: User): User | undefined {
      return user;
    }

    @Put("")
    @Authorized()
    async putMe(@CurrentUser() user: User, @Body() body: UpdateUserRequest): Promise<string> {
      user.private = new PrivateInformation();
      user.private.email = body.email;
      user.private.fullName = body.fullName;
      user.private.notifications = body.notifications;

      await Container.get(UserService).update(user);
      return "User updated";
    }

    @Delete("")
    @Authorized()
    removeMe(@CurrentUser() user: User): string {
      return "Deleting user " + user.username;
    }

    @Get("/search/:searchString")
    @Authorized()
    getSearchMatch(@Param("searchString") usernameSearch: string): Promise<string[]> {
      return Container.get(UserService).findUsers(usernameSearch);
    }

    @Post("")
    async post(@Body() body: CreateUserRequest): Promise<User> {
        const user = new User();
        user.username = body.username;
        user.private = new PrivateInformation();
        user.private.email = body.email;
        user.private.publickey = body.publickey;
        user.private.fullName = body.fullName;

        const newUser = await Container.get(UserService).create(user);
        if (newUser.username !== undefined) {
            return newUser;
        }


        throw new BadRequestError("Public key and/or username is already in use");
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

    @Get("/ticker")
    async getBalance(): Promise<object> {
      const url = "https://cex.io/api/ticker/XRP/EUR/";
      const params = {
        headers: {
          "content-type": "application/json; charset=UTF-8"
        },
        method: "GET"
      };
      return await (await fetch(url, params)).json();
    }

    @Get("/info")
    @Authorized()
    async getAccountInfo(@CurrentUser() user: User): Promise<object> {
      return Container.get(RippleLibService).getAccountInfo(user);
    }
}