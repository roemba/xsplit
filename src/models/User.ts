import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({name: "users"})
export class User {
    @PrimaryColumn()
    public username: string;

    @Column({name: "public_key"})
    public publickey: string;
}