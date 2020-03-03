import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, } from 'typeorm';
import { User } from './User';
import { Bill } from './Bill';

@Entity({ name: "transaction_requests" })
export class TransactionRequest {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column("timestamp")
    public date_created: Date;

    @Column({ type: "bigint"})
    public total_xrp: number;

    @ManyToOne(() => Bill, bill => bill.transaction_requests)
    public bill: Bill;

    @ManyToOne(() => User, user => user.transaction_requests, {
        eager: true
    })
    public debtor: User;

    @Column({default: false})
    public paid: boolean;

    @Column()
    public transaction_hash: string;
}