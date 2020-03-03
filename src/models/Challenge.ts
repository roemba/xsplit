import {Column, Entity, ManyToOne, PrimaryColumn} from "typeorm";
import {User} from "./User";


@Entity({name: "challenge"})
export class Challenge {
	@ManyToOne(() => User, user => user.username, {primary: true})
	public user: User;

	@PrimaryColumn()
	public challenge: string;

	@Column({type: "bigint"})
	public createdAt: number;
}
