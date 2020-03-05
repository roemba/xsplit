import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, BeforeInsert, } from 'typeorm';
import { User } from './User';
import { Bill } from './Bill';
import { Container } from 'typedi';
import { RippleLibService } from '../services/RippleLibService';

@Entity({ name: "transaction_requests" })
export class TransactionRequest {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column({ type: "bigint"})
    public dateCreated: number;

    @Column({ type: "bigint"})
    public totalXrp: number;

    @ManyToOne(() => Bill, bill => bill.transactionRequests, {
        eager: true
    })
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

        const payment = await Container.get(RippleLibService).getPayment(this.transactionHash);
        const balanceChanges = payment.outcome.balanceChanges;
        let foundPayment = false;
        for (const addr in balanceChanges) {
            if (this.bill.creditor.publickey === addr) {
                const changes = balanceChanges[addr];
                for (const change of changes) {
                    if (change.value === "XRP" && change.value === this.totalXrp + "") {
                        foundPayment = true;
                    }
                }
            }
        }
        return payment.outcome.result === "tesSUCCESS"
            && payment.type === "payment"
            && foundPayment;
    }
}