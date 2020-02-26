import { Service } from 'typedi';
import { RippleAPI } from "ripple-lib";

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
        this.log.info('Find all users');
        return this.rippleAPI.getServerInfo();
    }
}