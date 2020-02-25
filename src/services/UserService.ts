import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';

import { User } from '../models/User';
import { UserRepository } from '../repositories/UserRepository';
import winston, { Logger } from 'winston';

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

    public find(): Promise<User[]> {
        this.log.info('Find all users');
        return this.userRepository.find();
    }

    public findOne(username: string): Promise<User | undefined> {
        this.log.info('Find one user');
        return this.userRepository.findOne({ username });
    }

    public async create(user: User): Promise<User> {
        this.log.info('Create a new user => ', user.toString());
        const newUser = await this.userRepository.save(user);
        return newUser;
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