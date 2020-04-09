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
import { BadRequestError } from 'routing-controllers';
import { BillService } from './BillService';
import { TransactionRequest } from '../models/TransactionRequest';
import { TransactionRequestService } from './TransactionRequestService';

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
        return this.groupRepository.findOne({id});
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
        let group = await this.findOne(id);
        const balance = new GroupBalance();
        balance.balance = 0;
        balance.group = group;
        balance.user = user;
        await Container.get(GroupBalanceService).create(balance);
        group = await this.findOne(id);
        group.participants.push(user);
        await this.update(id, group);
        return this.findOne(id);
    }

    public async addBill(groupId: string, bill: Bill): Promise<Group> {
        this.log.info("Adding bill to group" + groupId);
        const group = await this.findOne(groupId);
        
        // Make sure all participants in bill are in the group
        for (const p of bill.participants) {
            if (group.participants.findIndex(part => part.username === p.username) === -1) {
                throw new BadRequestError("Participant in bill is not in group");
            }
        }
        bill.group = group;
        const createdBill = await Container.get(BillService).create(bill, false);
        group.bills.push(createdBill);
        const updatedGroup = this.updateBalances(group, bill);
        for (const b of updatedGroup.groupBalances) {
            await Container.get(GroupBalanceService).update(b.id, b);
        }
        return this.findOne(groupId);
    }

    public updateBalances(group: Group, bill: Bill): Group {
        // Add amount to creditor's balance
        const creditorBalance = group.groupBalances.find(balance => balance.user.username === bill.creditor.username);
        creditorBalance.balance += bill.totalXrpDrops;

        // For every participant, deduct share from balance
        let totalWeight = 0, totalDistributed = 0;
        bill.weights.forEach(w => totalWeight += w.weight);
        for (let i = 0; i < bill.participants.length; i++) {
            const dropShare = Math.floor(bill.totalXrpDrops / totalWeight * bill.weights[i].weight);
            totalDistributed += dropShare;
            const participantBalance = group.groupBalances.find(balance => balance.user.username === bill.participants[i].username);
            participantBalance.balance -= dropShare;
        }

        // Randomly distribute missing drops
        for (let i = 0; i < bill.totalXrpDrops - totalDistributed; i++) {
            const randomParticipant = bill.participants[Math.floor(Math.random() * bill.participants.length)].username;
            group.groupBalances.find(balance => balance.user.username === randomParticipant).balance -= 1;
        }
        return group;
    }

    public async settleGroup(id: string): Promise<Group> {
        const group = await this.findOne(id);
        // Check if all previous settlements are paid
        for (const tr of group.transactionRequests) {
            if (!tr.paid) {
                throw new BadRequestError("Previous settlement not finished yet");
            }
        }

        const requests = this.createSettlementTransactionRequests(group.groupBalances);
        for (const tr of requests) {
            tr.group = group;
            await Container.get(TransactionRequestService).create(tr);
        }
        return this.findOne(id);
    }

    public createSettlementTransactionRequests(balances: GroupBalance[]): TransactionRequest[] {
        // Get positive balances and sort desc, get negative and sort asc
        const positiveBalances = balances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance);
        const negativeBalances = balances.filter(b => b.balance < 0).sort((a, b) => a.balance - b.balance);
        let currentPositive = 0;
        const result: TransactionRequest[] = [];
        for (const negativeBalance of negativeBalances) {
            let balance = negativeBalance.balance;
            if (balance === 0) {
                break;
            }
            while (balance < 0) {
                if (positiveBalances[currentPositive].balance >= Math.abs(balance)) {
                    const tr = new TransactionRequest();
                    tr.creditor = positiveBalances[currentPositive].user;
                    tr.debtor = negativeBalance.user;
                    tr.totalXrpDrops = Math.abs(balance);
                    positiveBalances[currentPositive].balance += balance;
                    balance = 0;
                    result.push(tr);
                } else if (positiveBalances[currentPositive].balance < Math.abs(balance)) {
                    const tr = new TransactionRequest();
                    tr.creditor = positiveBalances[currentPositive].user;
                    tr.debtor = negativeBalance.user;
                    tr.totalXrpDrops = positiveBalances[currentPositive].balance;
                    balance += positiveBalances[currentPositive].balance;
                    currentPositive++;
                    result.push(tr);
                }
            }
        }
        return result;
    }

    public async settlementPaid(transaction: TransactionRequest): Promise<void> {
        this.log.info("Received payment for group settlement", transaction);
        const group = await this.findOne(transaction.group.id);
        const creditorBalance = group.groupBalances.find(b => b.user.username === transaction.creditor.username);
        const debtorBalance = group.groupBalances.find(b => b.user.username === transaction.debtor.username);
        creditorBalance.balance -= transaction.totalXrpDrops;
        debtorBalance.balance += transaction.totalXrpDrops;
        await Container.get(GroupBalanceService).update(creditorBalance.id, creditorBalance);
        await Container.get(GroupBalanceService).update(debtorBalance.id, debtorBalance);
    }

    public async delete(id: string): Promise<void> {
        this.log.info('Delete a group');
        await this.groupRepository.delete(id);
        return;
    }

}