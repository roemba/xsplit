import { Container } from "typedi";
import { EntityRepository, Repository } from 'typeorm';
import {getRepository} from "typeorm";
import { User } from '../models/User';
import {BadRequestError} from "routing-controllers";
import { LoggerService } from "../services/LoggerService";

@EntityRepository(User)
export class UserRepository extends Repository<User>  {
    
    log = Container.get(LoggerService);

    public async getPublicKey(username: string): Promise<string> {
        const user = await getRepository(User)
            .createQueryBuilder("user")
            .select("user.publickey")
            .where("user.username = :id", { id: username })
            .getOne();

        if (user == null) {
            throw new BadRequestError("Cannot find user with username!");
        }

        return user.publickey;
    }
}