import { Container } from "typedi";
import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { User } from '../models/User';
import { UserRepository } from '../repositories/UserRepository';
import { BadRequestError } from "routing-controllers";
import { LoggerService } from "../services/LoggerService";
import * as levenshtein from 'fast-levenshtein';
import { FindOneOptions } from "typeorm";
import { PrivateInformationRepository } from "../repositories/PrivateInformationRepository";

@Service()
export class UserService {

    log = Container.get(LoggerService);

    constructor(@OrmRepository() private userRepository: UserRepository,
                @OrmRepository() private privateRepository: PrivateInformationRepository) {}

    public findMe(user: User): Promise<User> {
        return this.userRepository.findOne({where: {username: user.username }, relations: ["private"]});
    }

    public async findUsers(search: string): Promise<string[]> {
        if(!search) {
            throw new BadRequestError("No search string was provided");
        } 
        const userMatches  = [];
        const users  = await this.userRepository.find();

        for(let i = 0; i < users.length; i++) {
            const deviation = users[i].username.length - (Math.floor(users[i].username.length*0.9));
            if(levenshtein.get(users[i].username, search) <= deviation) {
                userMatches.push(users[i].username);
            }
        }
        return userMatches;
    }

    public async getPublicKey(username: string): Promise<string> {
        username = username.trim();
        if(username.length === 0) {
            throw new BadRequestError("Empty username!");
        }

        return (await this.userRepository.findOne(username, {relations: ["private"]})).private.publickey;
    }

    public findOne(username: string, options?: FindOneOptions): Promise<User | undefined> {
        return this.userRepository.findOne({username}, options);
    }

    public async create(user: User): Promise<User> {
        await this.privateRepository.save(user.private);
        return this.userRepository.save(user);
    }

    public update(user: User): Promise<User> {
        this.log.info('Update a user');
        return this.userRepository.save(user);
    }

    public async delete(id: string): Promise<void> {
        this.log.info('Delete a user');
        await this.userRepository.delete(id);
        return;
    }

}