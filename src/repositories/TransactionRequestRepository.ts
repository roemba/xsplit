import { EntityRepository, Repository } from 'typeorm';

import { TransactionRequest } from '../models/TransactionRequest';

@EntityRepository(TransactionRequest)
export class TransactionRequestRepository extends Repository<TransactionRequest>  {

}