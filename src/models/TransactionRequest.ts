import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, BeforeInsert, } from 'typeorm';
import { User } from './User';
import { Bill } from './Bill';

@Entity({ name: "transaction_requests" })
export class TransactionRequest {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column({ type: "bigint"})
    public dateCreated: number;

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

    @Column()
    public transaction_hash: string;

    @BeforeInsert()
    public setDateCreated(): void {
        this.dateCreated = Date.now();
    }
}