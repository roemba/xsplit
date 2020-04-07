import { Entity, PrimaryColumn, OneToMany, ManyToMany, OneToOne, Column } from 'typeorm';
import { Bill } from './Bill';
import { TransactionRequest } from './TransactionRequest';
import { GroupBalance } from './GroupBalance';
import { Group } from './Group';
import { BillWeight } from './BillWeight';
import { PrivateInformation } from './PrivateInformation';

@Entity({name: "users"})
export class User {
    @PrimaryColumn()
    public username: string;

    @OneToOne(() => PrivateInformation, pi => pi.user, {
        eager: false
    })
    public private: PrivateInformation;

    @Column({name: "publickey", unique: true})
    public publickey: string;

    @OneToMany(() => Bill, bill => bill.creditor)
    public ownedBills: Bill[];

    @ManyToMany(() => Bill)
    public participatingInBills: Bill[];

    @ManyToMany(() => Group)
    public participatingInGroups: Group[];

    @OneToMany(() => GroupBalance, balance => balance.user)
    public groupBalances: GroupBalance[];

    @OneToMany(() => TransactionRequest, tr => tr.creditor)
    public creditorOfRequests: TransactionRequest[];

    @OneToMany(() => TransactionRequest, tr => tr.debtor)
    public transactionRequests: TransactionRequest[];

    @OneToMany(() => BillWeight, bw => bw.user)
    public billWeights: BillWeight[];

    @OneToMany(() => GroupBalance, tr => tr.user)
    public balances: GroupBalance[];
}
