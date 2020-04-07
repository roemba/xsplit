import { Container } from "typedi";
import { Service } from 'typedi';
import { TransactionRequestRepository } from '../repositories/TransactionRequestRepository';
import { OrmRepository } from 'typeorm-typedi-extensions';
import { TransactionRequest } from '../models/TransactionRequest';
import { User } from '../models/User';
import { FindOneOptions } from 'typeorm';
import { LoggerService } from "../services/LoggerService";
import { RippleLibService } from "./RippleLibService";
import { XRPUtil } from "../util/XRPUtil";
import { BadRequestError, UnauthorizedError } from "routing-controllers";
import rippleKey from "ripple-keypairs";
import { UserService } from "./UserService";

@Service()
export class TransactionRequestService {

    log = Container.get(LoggerService);

    constructor(@OrmRepository() private transactionRepository: TransactionRequestRepository) {}

    public find(): Promise<TransactionRequest[]> {
        this.log.info('Find all transaction requests');
        return this.transactionRepository.find();
    }

    public findRequestsToUser(user: User): Promise<TransactionRequest[]> {
        return this.transactionRepository.find({where: { debtor: { username: user.username }}});
    }

    public async validatePayment(tr: TransactionRequest): Promise<boolean> {
        if (tr.transactionHash === undefined || tr.transactionHash === null) {
            return false;
        }

        let payment;
        try {
            payment = await Container.get(RippleLibService).getPayment(tr.transactionHash);
        } catch (e) {
            throw new BadRequestError("Payment could not be retreived");
        }
        const balanceChanges = payment.outcome.balanceChanges;
        let foundPayment = false;

        const creditorAddress = rippleKey.deriveAddress(tr.creditor.publickey);
        // Loop through all addresses that had their balance changed
        for (const addr in balanceChanges) {
            // If address corresponds to the creditor's address, loop through the currencies and find XRP, validate if the value is equal to the totalXrp value
            // Convert XRP value to drops
            if (creditorAddress === addr) {
                const changes = balanceChanges[addr];
                for (const change of changes) {
                    if (change.currency === "XRP" && XRPUtil.XRPtoDrops(Number(change.value)) === tr.totalXrpDrops) {
                        foundPayment = true;
                    }
                }
            }
        }

        const debtor = await Container.get(UserService).findOne(tr.debtor.username);

        return payment.outcome.result === "tesSUCCESS"
            && payment.type === "payment"
            && payment.address === rippleKey.deriveAddress(debtor.publickey)
            && foundPayment;
    }

    public async setPaid(requester: User, id: string): Promise<TransactionRequest> {
        const tr = await this.transactionRepository.findOne(id, {relations: ["bill"]});
        if (tr.bill.creditor.username === requester.username) {
            await this.transactionRepository.update(tr.id, {paid: true});
            return this.transactionRepository.findOne(id);
        } else {
            throw new UnauthorizedError("This transaction request is not to you");
        }
    }

    public async isPaymentUnique(hash: string): Promise<boolean> {
        if (hash === undefined || hash === null) {
            return false;
        }
        const res = await this.transactionRepository.find({where: { transactionHash: hash}});
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