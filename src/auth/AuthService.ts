import * as express from 'express';
import {Container, Service} from 'typedi';
import {User} from '../models/User';
import {verify} from 'ripple-keypairs';
import {UserService} from "../services/UserService";
import {ChallengeRepository} from "../repositories/ChallengeRepository";
import { LoggerService } from "../services/LoggerService";
import {parse as cookieParse} from "cookie";

@Service()
export class AuthService {

    log = Container.get(LoggerService);

    public parseBearerAuthFromRequest(req: express.Request): { username: string; signature: string } {
        const cookieHeader = req.header("Cookie");

        if (cookieHeader) {
            const parsedCookie = cookieParse(cookieHeader);
            if (Object.prototype.hasOwnProperty.call(parsedCookie, "bearer")) {
                const bearer = parsedCookie['bearer'];
                this.log.info('Credentials provided by the client');
                const decodedBase64 = Buffer.from(bearer, 'base64').toString('ascii');
                const username = decodedBase64.split(':')[0];
                const signature = decodedBase64.split(':')[1];
                if (username && signature) {
                    return { username, signature };
                }
            }
        }

        this.log.info('No credentials provided by the client');
        return undefined;
    }

    public async validateUser(request: Request, username: string, signature: string): Promise<User> {
        const user = await Container.get(UserService).findOne(username);

        if (user == null) {
            return undefined;
        }

        const challenges = await Container.get(ChallengeRepository).getChallenges(user);
        for (const challengeObj of challenges) {
            try {
                if (verify(challengeObj.challenge, signature, user.publickey)) {
                    return user;
                }
            } catch (e) {
                // Do nothing, move on to try the next challenge
            }
        }

        return undefined;
    }

}
