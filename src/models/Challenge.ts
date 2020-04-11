import {Column, Entity, ManyToOne, PrimaryColumn, AfterLoad} from "typeorm";
import {User} from "./User";
import { bigIntToNumber } from "../util/PostGresUtil";


@Entity({name: "challenge"})
export class Challenge {
	@ManyToOne(() => User, user => user.username, {primary: true,
		onDelete: "NO ACTION"})
	public user: User;

	@PrimaryColumn()
	public challenge: string;

	@Column({type: "bigint"})
	public createdAt: number;

	@AfterLoad()
    convertBalanceToNumber(): void {
        this.createdAt = bigIntToNumber(this.createdAt);
    }
}
