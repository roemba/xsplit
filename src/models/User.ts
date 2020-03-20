import { Column, Entity, PrimaryColumn, OneToMany, ManyToMany } from 'typeorm';
import { Bill } from './Bill';
import { TransactionRequest } from './TransactionRequest';
import { GroupBalance } from './GroupBalance';
import { GroupBill } from './GroupBill';
import { Group } from './Group';

@Entity({name: "users"})
export class User {
    @PrimaryColumn()
    public username: string;

    @Column({name: "publickey", unique: true})
    public publickey: string;

    @Column({name: "email", nullable: true})
    public email: string | undefined;

    @Column({name: "fullName", nullable: true})
    public fullName: string | undefined;

    @OneToMany(() => Bill, bill => bill.creditor)
    public ownedBills: Bill[];

    @OneToMany(() => GroupBill, bill => bill.creditor)
    public ownedGroupBills: GroupBill[];

    @ManyToMany(() => Bill)
    public participatingInBills: Bill[];

    @ManyToMany(() => Group)
    public participatingInGroups: Group[];

    @ManyToMany(() => GroupBill)
    public participatingInGroupBills: GroupBill[];

    @OneToMany(() => GroupBalance, balance => balance.user)
    public groupBalances: GroupBalance[];

    @OneToMany(() => TransactionRequest, tr => tr.debtor)
    public transactionRequests: TransactionRequest[];

    @OneToMany(() => GroupBalance, tr => tr.user)
    public balances: GroupBalance[];
}
