import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, BeforeInsert } from 'typeorm';
import { User } from './User';

@Entity({ name: "group_bills" })
export class GroupBill {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column({default: ""})
    public description: string;

    @Column({type: "bigint"})
    public dateCreated: number;

    // totalXrp is stored in drops; 1 xrp is 1 million drops
    @Column({ type: "bigint"})
    public totalXrp: number;

    @ManyToOne(() => User, user => user.ownedBills, {
        eager: true
    })
    public creditor: User;

    @ManyToMany(() => User, {
        eager: true
    })
    @JoinTable()
    public participants: User[];

    @BeforeInsert()
    public setDateCreated(): void {
        this.dateCreated = Date.now();
    }
}