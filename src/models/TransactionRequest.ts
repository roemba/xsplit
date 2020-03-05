import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, BeforeInsert, } from 'typeorm';
import { User } from './User';
import { Bill } from './Bill';
import { Container } from 'typedi';
import { RippleLibService } from '../services/RippleLibService';
import { TransactionRequestService } from '../services/TransactionRequestService';

@Entity({ name: "transaction_requests" })
export class TransactionRequest {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column({ type: "bigint"})
    public dateCreated: number;

    // totalXrp is stored in drops; 1 xrp is 1 million drops
    @Column({ type: "bigint"})
    public totalXrp: number;

    @ManyToOne(() => Bill, bill => bill.transactionRequests)
    public bill: Bill;

    @ManyToOne(() => User, user => user.transaction_requests, {
        eager: true
    })
    public debtor: User;

    @Column({default: false})
    public paid: boolean;

    @Column({
        nullable: true
    })
    public transactionHash: string;

    @BeforeInsert()
    public setDateCreated(): void {
        this.dateCreated = Date.now();
    }

    public async validatePayment(): Promise<boolean> {
        if (this.transactionHash === null) {
            return false;
        }

        // Get the bill that corresponds to this payment, the bills is not eagerly loaded so this line ensures that the bill field is loaded
        const bill = (await Container.get(TransactionRequestService).findOne(this.id, {relations: ["bill"]})).bill

        const payment = await Container.get(RippleLibService).getPayment(this.transactionHash);
        const balanceChanges = payment.outcome.balanceChanges;
        let foundPayment = false;

        // Loop through all addresses that had their balance changed
        for (const addr in balanceChanges) {

            // If address corresponds to the creditor's address, loop through the currencies and find XRP, validate if the value is equal to the totalXrp value
            // Convert XRP value to drops
            if (bill.creditor.publickey === addr) {
                const changes = balanceChanges[addr];
                for (const change of changes) {
                    if (change.value === "XRP" && Number(change.value) * 1000000 === this.totalXrp) {
                        foundPayment = true;
                    }
                }
            }
        }
        return payment.outcome.result === "tesSUCCESS"
            && payment.type === "payment"
            && payment.address === this.debtor.publickey
            && foundPayment;
    }
}