import * as express from 'express';
import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';

import { User } from '../models/User';
import { UserRepository } from '../repositories/UserRepository';
import winston, { Logger } from "winston";

import {ecdsaVerify} from 'secp256k1';
import { SHA256, enc} from "crypto-js";
import { CryptoUtils} from "../util/CryptoUtils";

@Service()
export class AuthService {
    log: Logger;
    constructor(
        @OrmRepository() private userRepository: UserRepository
    ) { 
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
        const user = await this.userRepository.findOne({
            where: {
                username,
            },
        });

        const messageStr = await request.text();
        const messageHash = CryptoUtils.hexToUint8Array(SHA256(messageStr).toString(enc.Hex));

        const signature = CryptoUtils.hexToUint8Array(signatureStr);
        const pubKey = CryptoUtils.hexToUint8Array(user.publickey);

        try {
            if (ecdsaVerify(signature, messageHash, pubKey)) {
                return user;
            }
        } catch (e) {
            this.log.warning(e);
            return undefined;
        }

        return undefined
    }

}