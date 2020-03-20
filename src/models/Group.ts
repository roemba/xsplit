import { Column, Entity, PrimaryGeneratedColumn, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { User } from './User';
import { GroupBalance } from './GroupBalance';

@Entity({ name: "groups" })
export class Group {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column()
    public name: string;

    @Column({default: ""})
    public description: string;

    @ManyToMany(() => User, {
        eager: true
    })
    @JoinTable()
    public participants: User[];

    @OneToMany(() => GroupBalance, balance => balance.group, {
        eager: true
    })
    public groupBalances: GroupBalance[];
}