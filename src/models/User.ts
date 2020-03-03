import {Column, Entity, OneToMany, PrimaryColumn} from 'typeorm';
import {Challenge} from "./Challenge";

@Entity({name: "users"})
export class User {
    @PrimaryColumn()
    public username: string;

    @Column({name: "publickey"})
    public publickey: string;

    @Column({name: "email"})
    public email: string;

    @Column({name: "fullName"})
    public fullName: string;

    @OneToMany(() => Challenge, challenges => challenges.user)
    public challenges: Challenge[]
}
