import { Container } from "typedi";
import * as express from 'express';
import { ExpressErrorMiddlewareInterface, HttpError, Middleware } from 'routing-controllers';
import { LoggerService } from "../services/LoggerService";

@Middleware({ type: 'after' })
export class ErrorHandlerMiddleware implements ExpressErrorMiddlewareInterface {

    log = Container.get(LoggerService);

    public error(error: HttpError, req: express.Request, res: express.Response): void {
        res.status(error.httpCode || 500);
        res.statusMessage = error.message;
        res.json({
            name: error.name,
            message: error.message
        });
        
        this.log.error(error.message);
    }
}