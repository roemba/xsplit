import Container, { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { GroupRepository } from '../repositories/GroupRepository';
import { User } from '../models/User';
import { LoggerService } from "../services/LoggerService";
import { Group } from '../models/Group';
import { GroupBalanceService } from './GroupBalanceService';

@Service()
export class GroupService {

    log = Container.get(LoggerService);

    constructor(@OrmRepository() private groupRepository: GroupRepository) {}

    public find(): Promise<Group[]> {
        this.log.info('Find all groups');
        return this.groupRepository.find();
    }

    public async findUserGroups(user: User): Promise<Group[]> {
        // Finds all user balances and gets the bill from there. It's this way because the query is easier.
        const balances = await Container.get(GroupBalanceService).findUserBalances(user, {relations: ["group"]});
        return balances.map(e => e.group);
    }

    public findOne(id: string): Promise<Group | undefined> {
        this.log.info('Find one group');
        return this.groupRepository.findOne({ id });
    }

    public create(grp: Group): Promise<Group> {
        this.log.info('Create a new group => ', grp.toString());
        return this.groupRepository.save(grp);
    }

    public update(id: string, group: Group): Promise<Group> {
        this.log.info('Update a group');
        group.id = id;
        return this.groupRepository.save(group);
    }

    public async delete(id: string): Promise<void> {
        this.log.info('Delete a group');
        await this.groupRepository.delete(id);
        return;
    }

}