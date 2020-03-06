import * as express from 'express';
import { ExpressErrorMiddlewareInterface, HttpError, Middleware } from 'routing-controllers';
import winston, { Logger } from 'winston';

@Middleware({ type: 'after' })
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {
    log: Logger;
    constructor() {
        this.log = winston.createLogger({
            transports: [
                new winston.transports.Console()
              ]
        });
    }

    public error(error: HttpError, req: express.Request, res: express.Response): void {
        // routing-controllers already sends error on unauthorized request so don't send another one here
        res.status(error.httpCode || 500);
        res.json({
            name: error.name,
            message: error.message
        });
        this.log.error(error.message);
    }
}