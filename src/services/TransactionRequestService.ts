import { Service } from 'typedi';

import winston, { Logger } from 'winston';
import { TransactionRequestRepository } from '../repositories/TransactionRequestRepository';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { TransactionRequest } from '../models/TransactionRequest';
import { User } from '../models/User';
import { FindOneOptions } from 'typeorm';

@Service()
export class TransactionRequestService {

    log: Logger;

    constructor(
        @OrmRepository() private transactionRepository: TransactionRequestRepository
    ) {
        this.log = winston.createLogger({
            transports: [
                new winston.transports.Console()
              ]
        });
    }

    public find(): Promise<TransactionRequest[]> {
        this.log.info('Find all transaction requests');
        return this.transactionRepository.find();
    }

    public findRequestsToUser(user: User): Promise<TransactionRequest[]> {
        return this.transactionRepository.find({where: { debtor: { username: user.username }}})
    }

    public async isPaymentUnique(hash: string): Promise<boolean> {
        if (hash === undefined) {
            return false;
        }
        const res = await this.transactionRepository.find({where: { transactionHash: hash}})
        return res.length === 0;
    }

    public findOne(id: string, options?: FindOneOptions): Promise<TransactionRequest | undefined> {
        this.log.info('Find one transaction request');
        return this.transactionRepository.findOne({ id }, options);
    }

    public async create(transaction: TransactionRequest): Promise<TransactionRequest> {
        this.log.info('Create a new transaction request => ', transaction.toString());
        const newTransaction = await this.transactionRepository.save(transaction);
        return newTransaction;
    }

    public update(id: string, transaction: TransactionRequest): Promise<TransactionRequest> {
        this.log.info('Update a transaction request');
        transaction.id = id;
        return this.transactionRepository.save(transaction);
    }

    public async delete(id: string): Promise<void> {
        this.log.info('Delete a transaction request');
        await this.transactionRepository.delete(id);
        return;
    }
}