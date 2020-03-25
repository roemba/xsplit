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
import {User} from '../models/User';
import {LoggerService} from "../services/LoggerService";
import 'babel-polyfill';
import * as brandedQRCode from 'branded-qr-code';
import path from "path";
import {IsEmail, IsNotEmpty, IsString, MaxLength} from "class-validator";

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
  @MaxLength(4000)
  publickey: string;
}

@JsonController("/api/users")
export class UserController {
  
    log = Container.get(LoggerService);

    @Get("")
    @Authorized()
    getMe(@CurrentUser() user: User): Promise<User | undefined> {
        return Container.get(UserService).findMe(user);
    }

    @Put("")
    @Authorized()
    putMe(@CurrentUser() user: User): string {
      return "Updating the user " + user.username;
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
        user.email = body.email;
        user.publickey = body.publickey;

        const newUser = await Container.get(UserService).create(user);
        if (newUser.username !== undefined) {
            return newUser;
        }


        throw new BadRequestError("Public key and/or username is already in use");
    }

    @Put("")
    @Authorized()
    put(@CurrentUser() user: User, @Body() body: User): string {
      Container.get(UserService).update(user.username, body);
      return "Updating the user";
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