import winston, {Logger} from "winston";
import {Authorized, Controller, Get, QueryParam} from "routing-controllers";
import {Container} from "typedi";
import {UserService} from "../services/UserService";
import {OrmRepository} from "typeorm-typedi-extensions";
import {UserRepository} from "../repositories/UserRepository";
import {randomBytes} from "crypto";

@Controller("/api/login")
export class LoginController {
    log: Logger;

    constructor(@OrmRepository() private userRepository: UserRepository) {
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

    @Get("/challenge")
    async getChallenge(@QueryParam("username") userName: string): Promise<string> {
        const user = await Container.get(UserService).findOne(userName);

        user.challenge = randomBytes(32).toString("hex");
        await Container.get(UserService).update(userName, user);

        return user.challenge;
    }

    @Get("/validate")
    @Authorized()
    testSignature(): string {
        return "ok!";
    }
}
