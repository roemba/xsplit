import winston, {Logger} from "winston";
import {Controller, Post, Req, UseBefore} from "routing-controllers";
import {urlencoded} from "body-parser";
import {Request} from "express";
import {Container} from "typedi";
import {UserService} from "../services/UserService";

@Controller("/api/login")
export class LoginController {
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

    @Post("/")
    @UseBefore(urlencoded())
    userLogin(@Req() request: Request): Promise<string | Array<string>> {
        const username = request.body.userName;
        this.log.info("username " + username);
        return Container.get(UserService).getPublicKey(username);
    }
}