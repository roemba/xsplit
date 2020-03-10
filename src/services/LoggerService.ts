import { Service } from 'typedi';
import winston, { Logger } from 'winston';

@Service()
export class LoggerService {

    logger: Logger;

    constructor() {
        this.logger = winston.createLogger({
            transports: [
                new winston.transports.Console({
                    handleExceptions: true,
                    format: winston.format.combine(
                        winston.format.colorize(),
                        winston.format.simple()
                    )
                })
            ]
        });
    }

    /*eslint @typescript-eslint/no-explicit-any: ["error", { "ignoreRestArgs": true }]*/
    
    public error(message: string, ...meta: any[]): void {
        this.logger.error(message, ...meta);
    }

    public warn(message: string, ...meta: any[]): void {
        this.logger.warn(message, ...meta);
    }

    public info(message: string, ...meta: any[]): void {
        this.logger.info(message, ...meta);
    }

    public debug(message: string, ...meta: any[]): void {
        this.logger.debug(message, ...meta);
    }
}