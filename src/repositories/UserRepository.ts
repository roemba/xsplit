import { Container } from "typedi";
import { EntityRepository, Repository } from 'typeorm';
import { User } from '../models/User';
import { LoggerService } from "../services/LoggerService";

@EntityRepository(User)
export class UserRepository extends Repository<User>  {
    
    log = Container.get(LoggerService);

}