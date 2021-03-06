import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { User } from './User';
import { Bill } from './Bill';

@Entity({ name: "bill_weights" })
export class BillWeight {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @ManyToOne(() => User, user => user.billWeights, {
        eager: true,
        onDelete: 'CASCADE'
    })
    public user: User;

    @ManyToOne(() => Bill, bill => bill.weights, {
        onDelete: 'CASCADE'
    })
    public bill: Bill;

    // weight for a certain bill
    @Column()
    public weight: number;
}