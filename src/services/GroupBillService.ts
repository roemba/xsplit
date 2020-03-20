import Container, { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { User } from '../models/User';
import { LoggerService } from "../services/LoggerService";
import { GroupBillRepository } from '../repositories/GroupBillRepository';
import { GroupBill } from '../models/GroupBill';

@Service()
export class GroupBillService {

    log = Container.get(LoggerService);

    constructor(@OrmRepository() private groupBillRepository: GroupBillRepository) {}

    public find(): Promise<GroupBill[]> {
        this.log.info('Find all group bills');
        return this.groupBillRepository.find();
    }

    public findUserGroupBills(user: User): Promise<GroupBill[]> {
        return this.groupBillRepository.find({where: {bill: {creditor:{ username: user.username }}}});
    }

    public async deleteUserBills(user: User): Promise<void> {
        this.log.info('Delete all group bills');
        const bills = await this.findUserGroupBills(user);
        await this.groupBillRepository.remove(bills);
        return;
    }

    public findOne(id: string): Promise<GroupBill | undefined> {
        this.log.info('Find one group bill');
        return this.groupBillRepository.findOne({ id });
    }

    public async create(bill: GroupBill): Promise<GroupBill> {
        this.log.info('Create a new group bill => ', bill.toString());
        return this.groupBillRepository.save(bill);
    }

    public update(id: string, bill: GroupBill): Promise<GroupBill> {
        this.log.info('Update a group bill');
        bill.id = id;
        return this.groupBillRepository.save(bill);
    }

    public async delete(id: string): Promise<void> {
        this.log.info('Delete a group bill');
        await this.groupBillRepository.delete(id);
        return;
    }

}