import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity()
export class User {
    @PrimaryColumn()
    public username: string;

    @Column({name: "public_key"})
    public publickey: string;
}