import { EntityRepository, Repository } from 'typeorm';
import {getRepository} from "typeorm";
import winston, { Logger } from 'winston';

import { User } from '../models/User';

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
        return user.publickey;
    }
}