import Container, { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { User } from '../models/User';
import { LoggerService } from "../services/LoggerService";
import { GroupBalance } from '../models/GroupBalance';
import { GroupBalanceRepository } from '../repositories/GroupBalanceRepository';
import { FindManyOptions } from 'typeorm';

@Service()
export class GroupBalanceService {

    log = Container.get(LoggerService);

    constructor(@OrmRepository() private groupBalanceRepository: GroupBalanceRepository) {}

    public find(): Promise<GroupBalance[]> {
        this.log.info('Find all users');
        return this.groupBalanceRepository.find();
    }

    public findUserBalances(user: User, options?: FindManyOptions<GroupBalance>): Promise<GroupBalance[]> {
        // Finds all user balances.
        return this.groupBalanceRepository.find({where: {user: {username: user.username}}, ...options});
    }

    public create(balance: GroupBalance): Promise<GroupBalance> {
        this.log.info('Create a new balance => ', balance.toString());
        return this.groupBalanceRepository.save(balance);
    }

    public update(id: string, balance: GroupBalance): Promise<GroupBalance> {
        this.log.info('Update a balance');
        balance.id = id;
        return this.groupBalanceRepository.save(balance);
    }
}