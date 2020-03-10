import Container, { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';
import winston, { Logger } from 'winston';
import { BillRepository } from '../repositories/BillRepository';
import { Bill } from '../models/Bill';
import { User } from '../models/User';
import { TransactionRequestService } from './TransactionRequestService';
import { TransactionRequest } from '../models/TransactionRequest';

@Service()
export class BillService {

    log: Logger;

    constructor(
        @OrmRepository() private billRepository: BillRepository
    ) {
        this.log = winston.createLogger({
            transports: [
                new winston.transports.Console()
              ]
        });
    }

    public find(): Promise<Bill[]> {
        this.log.info('Find all users');
        return this.billRepository.find();
    }

    public findUserBills(user: User): Promise<Bill[]> {
        return this.billRepository.find({where: {bill: {creditor:{ username: user.username }}}});
    }

    public async deleteUserBills(user: User): Promise<void> {
        this.log.info('Delete a bill');
        const bills = await this.findUserBills(user);
        await this.billRepository.remove(bills);
        return;
    }

    public findOne(id: string): Promise<Bill | undefined> {
        this.log.info('Find one user');
        return this.billRepository.findOne({ id });
    }

    public async create(bill: Bill): Promise<Bill> {
        this.log.info('Create a new bill => ', bill.toString());
        let newBill = await this.billRepository.save(bill);
        newBill = await this.createTransactionRequests(newBill);
        return newBill;
    }

    public async createTransactionRequests(bill: Bill): Promise<Bill> {
        const transactionService = Container.get(TransactionRequestService);
        for (let i = 0; i < bill.participants.length; i++) {
            const tr = new TransactionRequest();
            tr.bill = bill;
            tr.debtor = bill.participants[i];
            tr.totalXrp = Math.round(bill.totalXrp / bill.participants.length);
            await transactionService.create(tr);
        }
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