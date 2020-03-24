import { EntityRepository, Repository } from 'typeorm';

import { BillWeight } from '../models/BillWeight';

@EntityRepository(BillWeight)
export class BillWeightRepository extends Repository<BillWeight>  {

}