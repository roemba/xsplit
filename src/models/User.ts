import { Column, Entity, PrimaryColumn, OneToMany, ManyToMany } from 'typeorm';
import { Bill } from './Bill';
import { TransactionRequest } from './TransactionRequest';

@Entity()
export class User {
    @PrimaryColumn()
    public username: string;

    @Column({name: "public_key"})
    public publickey: string;

    @OneToMany(() => Bill, bill => bill.creditor)
    public owned_bills: Bill[];

    @ManyToMany(() => Bill)
    public participating_in: Bill[];

    @OneToMany(() => TransactionRequest, tr => tr.debtor)
    public transaction_requests: TransactionRequest[];
}