import { Service } from 'typedi';
import { RippleAPI, FormattedTransactionType } from "ripple-lib";

import winston, { Logger } from 'winston';
import { GetServerInfoResponse } from 'ripple-lib/dist/npm/common/serverinfo';

@Service()
export class RippleLibService {

    log: Logger;
    rippleAPI: RippleAPI;

    constructor() {
        this.log = winston.createLogger({
            transports: [
                new winston.transports.Console()
              ]
        });
    }

    public async init(): Promise<void> {
        this.rippleAPI = new RippleAPI({server: process.env.RIPPLE_SERVER});
        return this.rippleAPI.connect();
    }

    public getServerInfo(): Promise<GetServerInfoResponse> {
        this.log.info('Get ripple server info');
        return this.rippleAPI.getServerInfo();
    }

    public getPayment(hash: string): Promise<FormattedTransactionType> {
        return this.rippleAPI.getTransaction(hash);
    }
}