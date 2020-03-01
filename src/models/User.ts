import { Column, Entity, PrimaryColumn} from 'typeorm';

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