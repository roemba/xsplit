import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, BeforeInsert, AfterLoad } from 'typeorm';
import { User } from './User';
import { Bill } from './Bill';
import { bigIntToNumber } from '../util/PostGresUtil';
import { Group } from './Group';

@Entity({ name: "transaction_requests" })
export class TransactionRequest {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column({ type: "bigint"})
    public dateCreated: number;
  
    // totalXrp is stored in drops; 1 xrp is 1 million drops
    @Column({ type: "bigint"})
    public totalXrpDrops: number;

    @ManyToOne(() => Bill, bill => bill.transactionRequests, {
        onDelete: "CASCADE"
    })
    public bill: Bill;

    @ManyToOne(() => Group, group => group.transactionRequests, {
        onDelete: "CASCADE"
    })
    public group: Group;

    @ManyToOne(() => User, user => user.creditorOfRequests, {
        eager: true
    })
    public creditor: User;

    @ManyToOne(() => User, user => user.transactionRequests, {
        eager: true
    })
    public debtor: User;

    @Column({default: false})
    public paid: boolean;

    @Column({
        nullable: true
    })
    public transactionHash: string;

    @BeforeInsert()
    public setDateCreated(): void {
        this.dateCreated = Date.now();
    }

    @AfterLoad()
    convertXrpToNumber(): void {
        this.totalXrpDrops = bigIntToNumber(this.totalXrpDrops);
        this.dateCreated = bigIntToNumber(this.dateCreated);
    }
}