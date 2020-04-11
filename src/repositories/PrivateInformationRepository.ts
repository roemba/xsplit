import { EntityRepository, Repository, getConnection } from 'typeorm';
import {getRepository} from "typeorm";
import { PrivateInformation } from '../models/PrivateInformation';

@EntityRepository(PrivateInformation)
export class PrivateInformationRepository extends Repository<PrivateInformation>  {
    public async removePrivateInfo(id: string): Promise<void> {
        getRepository(PrivateInformation)
            .createQueryBuilder()
            .delete()
            .where("id= :id", {id: id})
            .execute(); 
    }

    /*public async getPublicKey(username: string): Promise<string> {
        const user = await getRepository(User)
            .createQueryBuilder("user")
            .select("user.publickey")
            .where("user.username = :id", { id: username })
            .getOne();

        if (user == null) {
            throw new BadRequestError("Cannot find user with username!");
        }

        return user.publickey;
    }*/
}