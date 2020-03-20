import { EntityRepository, Repository } from 'typeorm';

import { GroupBill } from '../models/GroupBill';

@EntityRepository(GroupBill)
export class GroupBillRepository extends Repository<GroupBill>  {

}