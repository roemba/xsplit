import { Container } from "typedi";
import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { User } from '../models/User';
import { UserRepository } from '../repositories/UserRepository';
import {BadRequestError} from "routing-controllers";
import { LoggerService } from "../services/LoggerService";

@Service()
export class UserService {

    log = Container.get(LoggerService);

    constructor(@OrmRepository() private userRepository: UserRepository) {}

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

    public async create(user: User): Promise<User> {
        const tempUser = await this.userRepository.findOne(user.username);
        if(tempUser == null) {
            const newUser = await this.userRepository.save(user);
            return newUser;
        } else {
            throw new BadRequestError("There already exists a user with this username, please try another one");
        }
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