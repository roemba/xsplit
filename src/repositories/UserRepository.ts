import { EntityRepository, Repository } from 'typeorm';
import {getRepository} from "typeorm";
import winston from 'winston';

import { User } from '../models/User';
import {BadRequestError} from "routing-controllers";

@EntityRepository(User)
export class UserRepository extends Repository<User>  {
    log = winston.createLogger({
        transports: [
            new winston.transports.Console()
        ]
    });

    public async getPublicKey(username: string): Promise<string> {
        const user = await getRepository(User)
            .createQueryBuilder("user")
            .select("user.publickey")
            .where("user.username = :id", { id: username })
            .getOne();

        if (user == null) {
            throw new BadRequestError("Cannot find user with username!")
        }

        return user.publickey;
    }
}