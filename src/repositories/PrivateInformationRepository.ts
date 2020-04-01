import { EntityRepository, Repository } from 'typeorm';

import { PrivateInformation } from '../models/PrivateInformation';

@EntityRepository(PrivateInformation)
export class PrivateInformationRepository extends Repository<PrivateInformation>  {

}