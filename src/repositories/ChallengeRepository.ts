import { Container } from "typedi";
import {EntityRepository, getRepository, Raw, Repository} from 'typeorm';
import {User} from '../models/User';
import {Challenge} from "../models/Challenge";
import {randomBytes} from "crypto";
import { LoggerService } from "../services/LoggerService";

@EntityRepository(Challenge)
export class ChallengeRepository extends Repository<Challenge>  {
    
    log = Container.get(LoggerService);
    expireTime = Number(process.env.SESSION_EXPIRY_IN_MINUTES) * 60000;
    frontendTimeMargin = 10 * 1000;

    public async createChallenge(user: User): Promise<object> {
        const challenge = new Challenge();
        challenge.user = user;
        challenge.challenge = randomBytes(32).toString("hex");
        challenge.createdAt = Date.now();

        await getRepository(Challenge).save(challenge);

        return {
            challenge: challenge.challenge,
            expiresIn: this.expireTime - this.frontendTimeMargin
        };
    }

    public async getChallenges(user: User): Promise<Challenge[]> {
        return await getRepository(Challenge).find({
            where: {
                "user": user
            }
        });
    }

    public async cleanChallenges(): Promise<void> {
        try {
            const repo = await getRepository(Challenge);
            const challenges = await repo.find({
                where: {
                    "createdAt": Raw(alias => `${Date.now().toString()} - ${alias} > ${this.expireTime}`)
                }
            });
            if (challenges.length > 0) {
                this.log.info(`Deleting ${challenges.length} stale challenges...`);
                for (const challenge of challenges) {
                    repo.delete(challenge);
                }
            }
        } catch (e) {
            this.log.error(e);
        }
    }

}
