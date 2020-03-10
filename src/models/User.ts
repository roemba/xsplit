import { Column, Entity, PrimaryColumn, OneToMany, ManyToMany } from 'typeorm';
import { Bill } from './Bill';
import { TransactionRequest } from './TransactionRequest';

@Entity({name: "users"})
export class User {
    @PrimaryColumn()
    public username: string;

    @Column({name: "publickey"})
    public publickey: string;

    @Column({name: "email", nullable: true})
    public email: string | undefined;

    @Column({name: "fullName", nullable: true})
    public fullName: string | undefined;

    @OneToMany(() => Bill, bill => bill.creditor)
    public ownedBills: Bill[];

    @ManyToMany(() => Bill)
    public participatingIn: Bill[];

    @OneToMany(() => TransactionRequest, tr => tr.debtor)
    public transactionRequests: TransactionRequest[];
}
