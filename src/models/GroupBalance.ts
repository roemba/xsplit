import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, AfterLoad } from 'typeorm';
import { User } from './User';
import { Group } from './Group';
import { bigIntToNumber } from '../util/PostGresUtil';

@Entity({ name: "group_balances" })
export class GroupBalance {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @ManyToOne(() => User, user => user.ownedBills, {
        eager: true
    })
    public user: User;

    @ManyToOne(() => Group, group => group.groupBalances)
    public group: Group;

    // totalXrp is stored in drops; 1 xrp is 1 million drops
    @Column({ type: "bigint"})
    public balance: number;

    @AfterLoad()
    convertBalanceToNumber(): void {
        this.balance = bigIntToNumber(this.balance);
    }
}