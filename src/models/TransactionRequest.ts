import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, BeforeInsert, AfterLoad } from 'typeorm';
import { User } from './User';
import { Bill } from './Bill';

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
        this.totalXrpDrops = parseInt(this.totalXrpDrops as unknown as string);
    }
}