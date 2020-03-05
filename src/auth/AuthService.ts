import * as express from 'express';
import {Container, Service} from 'typedi';

import {User} from '../models/User';
import winston, {Logger} from "winston";
import {ecdsaVerify} from 'secp256k1';
import {CryptoUtils} from "../util/CryptoUtils";
import {UserService} from "../services/UserService";
import {ChallengeRepository} from "../repositories/ChallengeRepository";

@Service()
export class AuthService {
    log: Logger;
    constructor() {
        this.log = winston.createLogger({
            transports: [
                new winston.transports.Console()
              ]
        });
    }

    public parseBearerAuthFromRequest(req: express.Request): { username: string; signature: string } {
        const authorization = req.header('authorization');

        if (authorization && authorization.split(' ')[0] === 'Bearer') {
            this.log.info('Credentials provided by the client');
            const decodedBase64 = Buffer.from(authorization.split(' ')[1], 'base64').toString('ascii');
            const username = decodedBase64.split(':')[0];
            const signature = decodedBase64.split(':')[1];
            if (username && signature) {
                return { username, signature };
            }
        }

        this.log.info('No credentials provided by the client');
        return undefined;
    }

    public async validateUser(request: Request, username: string, signatureStr: string): Promise<User> {
        const user = await Container.get(UserService).findOne(username);

        if (user == null) {
            return undefined;
        }

        const signature = CryptoUtils.hexToUint8Array(signatureStr);
        const pubKey = CryptoUtils.hexToUint8Array(user.publickey);

        const challenges = await Container.get(ChallengeRepository).getChallenges(user);
        for (const challengeObj of challenges) {
            const challenge = CryptoUtils.hexToUint8Array(challengeObj.challenge);

            try {
                if (ecdsaVerify(signature, challenge, pubKey)) {
                    return user;
                }
            } catch (e) {
                // Do nothing, move on to try the next challenge
            }
        }

        return undefined
    }

}
