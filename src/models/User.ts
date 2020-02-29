import { Exclude } from 'class-transformer';
import { BeforeInsert, Column, Entity, OneToMany, PrimaryColumn, Table } from 'typeorm';

@Entity({name: "users"})
export class User {
    @PrimaryColumn()
    public username: string;

    @Column({name: "publickey"})
    public publickey: string;

    @Column({name: "email"})
    public email: string

    @Column({name: "fullName"})
    public fullName: string
}