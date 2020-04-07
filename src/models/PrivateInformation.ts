import { Column, Entity, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';

@Entity({name: "private_information"})
export class PrivateInformation {
    @PrimaryGeneratedColumn("uuid")
    public id: string;

    @Column({name: "email", nullable: false})
    public email: string;

    @Column({name: "fullName", nullable: true})
    public fullName: string;

    @Column({name: "notifications", default: false})
    public notifications: boolean | undefined;

    @OneToOne(() => User, user => user.private, {
        onUpdate: 'CASCADE'
    })
    @JoinColumn()
    public user: User;
}
