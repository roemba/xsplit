import Container, { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { GroupRepository } from '../repositories/GroupRepository';
import { User } from '../models/User';
import { LoggerService } from "../services/LoggerService";
import { Group } from '../models/Group';
import { GroupBalanceService } from './GroupBalanceService';
import { GroupBalance } from '../models/GroupBalance';
import { UserService } from './UserService';
import { Bill } from '../models/Bill';

@Service()
export class GroupService {

    log = Container.get(LoggerService);

    constructor(@OrmRepository() private groupRepository: GroupRepository) {}

    public find(): Promise<Group[]> {
        this.log.info('Find all groups');
        return this.groupRepository.find();
    }

    public async findUserGroups(user: User): Promise<Group[]> {
        // Finds all user balances and gets the bill from there. It's implemented this way because the query is easier.
        const balances = await Container.get(GroupBalanceService).findUserBalances(user, {relations: ["group"]});
        return balances.map(e => e.group);
    }

    public findOne(id: string): Promise<Group | undefined> {
        this.log.info('Find one group');
        return this.groupRepository.findOne({ id });
    }

    public async create(grp: Group): Promise<Group> {
        this.log.info('Create a new group => ', grp.toString());
        const created = await this.groupRepository.save(grp);
        return this.initializeBalances(created);
    }

    public async initializeBalances(group: Group): Promise<Group> {
        for (const user of group.participants) {
            const balance = new GroupBalance();
            balance.balance = 0;
            balance.group = group;
            balance.user = user;
            await Container.get(GroupBalanceService).create(balance);
        }
        return this.findOne(group.id);
    }

    public update(id: string, group: Group): Promise<Group> {
        this.log.info('Update a group');
        group.id = id;
        return this.groupRepository.save(group);
    }

    public async addParticipant(id: string, username: string): Promise<Group> {
        const user = await Container.get(UserService).findOne(username);
        const group = await this.findOne(id);
        const balance = new GroupBalance();
        balance.balance = 0;
        balance.group = group;
        balance.user = user;
        group.participants.push(user);
        group.groupBalances.push(balance);
        return this.update(id, group);
    }

    public async addBill(user: User, groupId: string, bill: Bill): Promise<Group> {
        const group = await this.findOne(groupId);
        const newBill = new Bill();
        newBill.creditor = user;
        newBill.description = bill.description;
        newBill.participants = bill.participants;
        newBill.totalXrpDrops = bill.totalXrpDrops;
        group.bills.push(newBill);
        return this.update(groupId, group);
    }

    public async delete(id: string): Promise<void> {
        this.log.info('Delete a group');
        await this.groupRepository.delete(id);
        return;
    }

}