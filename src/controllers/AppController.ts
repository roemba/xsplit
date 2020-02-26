import {Controller, Param, Body, Get, Post, Put, Delete, Render, Res, Req, Authorized, CurrentUser} from "routing-controllers";
import { Container } from "typedi";
import { UserService } from "../services/UserService";
import winston, { Logger } from "winston";
import { RippleLibService } from "../services/RippleLibService";
import { User } from "../models/User";
import { GetServerInfoResponse } from "ripple-lib/dist/npm/common/serverinfo";

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
   @Get("/api")
   getAll(): Promise<GetServerInfoResponse> {
      return Container.get(RippleLibService).getServerInfo();
   }

   @Get("/web/:page")
   @Render("index.ejs")
   getEJSView(@Param("page") page: string): unknown {
      this.log.info("Go to page " + page)
      return {page};
   }

   @Authorized()
   @Get("/me")
   getMe(@CurrentUser({ required: true }) me: User): User {
      return me;
   }

}