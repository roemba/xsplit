import {Container} from "typedi";
import {Authorized, BadRequestError, Controller, Get, QueryParam, CurrentUser} from "routing-controllers";
import {UserService} from "../services/UserService";
import {ChallengeRepository} from "../repositories/ChallengeRepository";
import { LoggerService } from "../services/LoggerService";
import { User } from "../models/User";

@Controller("/api/login")
export class LoginController {

    log = Container.get(LoggerService);

    @Get("/challenge")
    async getChallenge(@QueryParam("username") userName: string): Promise<object> {
        const user = await Container.get(UserService).findOne(userName);
        if (user == null) {
            throw new BadRequestError("Cannot find User!");
        }

        return await Container.get(ChallengeRepository).createChallenge(user);
    }

    @Get("/validate")
    @Authorized()
    testSignature(): string {
        return "ok!";
    }

    @Get("/whoAmI")
    @Authorized()
    whoAmI(@CurrentUser() user: User): object {
        return {username: user.username};
    }
}
