import { Service } from 'typedi';
import * as rippleLib from "ripple-lib";

import winston, { Logger } from 'winston';

@Service()
export class RippleLibService {

    log: Logger;
    rippleAPI: any;

    constructor() {
        this.log = winston.createLogger({
            transports: [
                new winston.transports.Console()
              ]
        });
    }

    public async init() {
        this.rippleAPI = new rippleLib.RippleAPI({server: process.env.RIPPLE_SERVER});
        return this.rippleAPI.connect();
    }

    public getServerInfo(): Promise<any> {
        this.log.info('Find all users');
        return this.rippleAPI.getServerInfo();
    }
}