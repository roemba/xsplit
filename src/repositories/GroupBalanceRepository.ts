import { EntityRepository, Repository } from 'typeorm';

import { GroupBalance } from '../models/GroupBalance';

@EntityRepository(GroupBalance)
export class GroupBalanceRepository extends Repository<GroupBalance>  {

}