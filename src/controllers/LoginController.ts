import winston, {Logger} from "winston";
import {Controller, Get, QueryParam} from "routing-controllers";
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

    @Get("/")
    userLogin(@QueryParam("username") userName: string): Promise<string | Array<string>> {
        this.log.info("username " + userName);
        return Container.get(UserService).getPublicKey(userName);
    }
}
