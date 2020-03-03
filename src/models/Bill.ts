import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { User } from './User';
import { TransactionRequest } from './TransactionRequest';

@Entity({ name: "bills" })
export class Bill {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column()
    public description: string;

    @Column("timestamp")
    public date_created: Date;

    @Column({ type: "numeric"})
    public total_xrp: number;

    @ManyToOne(() => User, user => user.owned_bills, {
        eager: true
    })
    public creditor: User;

    @ManyToMany(() => User, {
        eager: true
    })
    @JoinTable()
    public participants: User[];

    @OneToMany(() => TransactionRequest, tr => tr.bill, {
        eager: true
    })
    public transaction_requests: TransactionRequest[];
}