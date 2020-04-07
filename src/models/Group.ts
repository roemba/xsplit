import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { User } from './User';
import { GroupBalance } from './GroupBalance';
import { Bill } from './Bill';
import { TransactionRequest } from './TransactionRequest';

@Entity({ name: "groups" })
export class Group {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column()
    public name: string;

    @Column({default: ""})
    public description: string;

    @OneToMany(() => GroupBalance, balance => balance.group, {
        eager: true
    })
    public groupBalances: GroupBalance[];

    @OneToMany(() => TransactionRequest, tr => tr.group, {
        eager: true
    })
    public transactionRequests: TransactionRequest[];

    @ManyToMany(() => User, {
        eager: true
    })
    @JoinTable()
    public participants: User[];

    @OneToMany(() => Bill, bill => bill.group, {
        eager: true
    })
    public bills: Bill[];
}