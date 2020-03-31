import Container, { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { BillRepository } from '../repositories/BillRepository';
import { Bill } from '../models/Bill';
import { User } from '../models/User';
import { NotificationService } from '../services/NotificationService';
import { TransactionRequestService } from './TransactionRequestService';
import { TransactionRequest } from '../models/TransactionRequest';
import { LoggerService } from "../services/LoggerService";
import { BillWeightRepository } from '../repositories/BillWeightRepository';
import { UnauthorizedError } from 'routing-controllers';

@Service()
export class BillService {

    log = Container.get(LoggerService);

    constructor(@OrmRepository() private billRepository: BillRepository,
                @OrmRepository() private billWeightRepository: BillWeightRepository) {}

    public find(): Promise<Bill[]> {
        this.log.info('Find all users');
        return this.billRepository.find();
    }

    public findUserBills(user: User): Promise<Bill[]> {
        return this.billRepository.find({where: {bill: {creditor:{ username: user.username }}}});
    }

    public async findUserBill(user: User, id: string): Promise<Bill> {
        const bill = await this.billRepository.findOne(id);
        if (bill.creditor.username === user.username) {
            return bill;
        } else {
            throw new UnauthorizedError("Bill does not belong to user");
        }
    }

    public async deleteUserBills(user: User): Promise<void> {
        this.log.info('Delete all user bills');
        const bills = await this.findUserBills(user);
        await this.billRepository.remove(bills);
        return;
    }

    public async deleteUserBill(user: User, id: string): Promise<void> {
        this.log.info(`Delete a bill from ${user.username} => ${id}`);
        const bill = await this.billRepository.findOne(id);
        if (bill.creditor.username === user.username) {
            await this.billRepository.remove(bill);
        } else {
            throw new UnauthorizedError("Bill does not belong to user");
        }
    }

    public findOne(id: string): Promise<Bill | undefined> {
        this.log.info('Find one bill');
        return this.billRepository.findOne({ id });
    }

    public async create(bill: Bill): Promise<Bill> {
        this.log.info('Create a new bill => ', bill.toString());
        let newBill = await this.billRepository.save(bill);
        for (const weight of newBill.weights) {
            await this.billWeightRepository.save(weight);
        }
        newBill = await this.findOne(newBill.id);
        newBill = await this.createTransactionRequests(newBill);
        return newBill;
    }

    public async createTransactionRequests(bill: Bill): Promise<Bill> {
        const transactionService = Container.get(TransactionRequestService);
        let totalWeight = 0;
        bill.weights.forEach(w => totalWeight += w.weight);
        for (let i = 0; i < bill.participants.length; i++) {
            const tr = new TransactionRequest();
            tr.bill = bill;
            tr.debtor = bill.participants[i];
            tr.totalXrpDrops = Math.round(bill.totalXrpDrops / totalWeight * bill.weights[i].weight);
            if(tr.debtor.username === bill.creditor.username) {
                tr.paid = true;
            }
            await transactionService.create(tr);
        }
        Container.get(NotificationService).sendPaymentRequestNotification(bill.participants);
        return Container.get(BillService).findOne(bill.id);
    }

    public update(id: string, bill: Bill): Promise<Bill> {
        this.log.info('Update a bill');
        bill.id = id;
        return this.billRepository.save(bill);
    }

    public async delete(id: string): Promise<void> {
        this.log.info('Delete a bill');
        await this.billRepository.delete(id);
        return;
    }

}