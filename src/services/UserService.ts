import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';

import { User } from '../models/User';
import { UserRepository } from '../repositories/UserRepository';
import winston, { Logger } from 'winston';
import {BadRequestError} from "routing-controllers";

@Service()
export class UserService {
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

    public findAll(): Promise<User[]> {
        this.log.info('Find all users');
        
        return this.userRepository.find();
    }

    public async getPublicKey(username: string): Promise<string> {
        username = username.trim();
        if(username.length === 0) {
            throw new BadRequestError("Empty username!")
        }

        return this.userRepository.getPublicKey(username);
    }

    public findOne(username: string): Promise<User | undefined> {
        this.log.info('Find one user');
        return this.userRepository.findOne({username});
    }

    public async create(user: User): Promise<User | Array<string>> {
        const errors = Array<string>();
        let username = user.username

        if(!this.isEmail(user.email.trim())) {
            errors.push("Email address is not of the proper format");
        }
        username = username.trim();
        if(user.publickey.trim().length === 0) {
            errors.push("Necessary field public key is empty");
        }
        
        if(username.length === 0) {
            errors.push("Necessary field username is empty");
        }

        if(errors.length === 0) {
            const tempUser = await this.userRepository.findOne({username});
            if(tempUser.username.localeCompare("undefined")) {
                errors.push("There already exists a user with this username, please try another one")
            } else {
                const newUser = await this.userRepository.save(user);
                return newUser;
            }
        }
        return errors;
    }

    //Based on regular expression in this thread: https://tylermcginnis.com/validate-email-address-javascript/
    private isEmail(email: string): boolean {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    }

    public update(username: string, user: User): Promise<User> {
        this.log.info('Update a user');
        user.username = username;
        return this.userRepository.save(user);
    }

    public async delete(id: string): Promise<void> {
        this.log.info('Delete a user');
        await this.userRepository.delete(id);
        return;
    }

}