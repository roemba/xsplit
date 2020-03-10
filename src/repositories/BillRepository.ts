import { EntityRepository, Repository } from 'typeorm';

import { Bill } from '../models/Bill';

@EntityRepository(Bill)
export class BillRepository extends Repository<Bill>  {

}