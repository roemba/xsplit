import { Container } from "typedi";
import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { User } from '../models/User';
import { UserRepository } from '../repositories/UserRepository';
import { BadRequestError } from "routing-controllers";
import { LoggerService } from "../services/LoggerService";
import * as levenshtein from 'fast-levenshtein';

@Service()
export class UserService {

    log = Container.get(LoggerService);

    constructor(@OrmRepository() private userRepository: UserRepository) {}

    public findMe(user: User): Promise<User> {
        return this.userRepository.findOne({where: {username: user.username }});
    }

    public findAll(): Promise<User[]> {
        this.log.info('Find all users');
        
        return this.userRepository.find();
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

        return this.userRepository.getPublicKey(username);
    }

    public findOne(username: string): Promise<User | undefined> {
        return this.userRepository.findOne({username});
    }

    public async create(user: User): Promise<User> {
        const tempUser = await this.userRepository.findOne({username: user.username});
        if(tempUser === undefined) {
            const newUser = await this.userRepository.save(user);
            return newUser;
        } else {
            return tempUser;
        }
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