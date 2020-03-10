import { Container } from "typedi";
import { Service } from 'typedi';
import { RippleAPI, FormattedTransactionType } from "ripple-lib";
import { GetServerInfoResponse } from 'ripple-lib/dist/npm/common/serverinfo';
import { LoggerService } from "../services/LoggerService";

@Service()
export class RippleLibService {

    log = Container.get(LoggerService);
    rippleAPI: RippleAPI;

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