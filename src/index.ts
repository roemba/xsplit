import dotenv from "dotenv";
import "reflect-metadata";
import { Container } from "typedi";
import { setupTypeORM } from "./typeORMLoader";
import { useContainer } from "typeorm";
import { RippleLibService } from "./services/RippleLibService";

import {ChallengeRepository} from "./repositories/ChallengeRepository";
import { LoggerService } from "./services/LoggerService";
import { setupExpressApp } from "./expressLoader";

// Set up the typeorm and typedi integration
useContainer(Container);

// Initialise the dotenv environment
dotenv.config();

const logger = Container.get(LoggerService);

// Initialise the ripple-lib service
let retries = 0;
const xrpConnection = setInterval(function() {
    if (parseInt(process.env.MAX_RECONNECT) > retries) {
        Container.get(RippleLibService).init().then(() => {
            logger.info("Connected to ripple!");
            clearInterval(xrpConnection);
        }).catch((e) => {
            retries += 1;
            logger.error(e);
            logger.error(`Connecting to ripple failed! (attempt: ${retries})`);
        });
    } else {
        logger.error(`Connecting to ripple failed ${process.env.MAX_RECONNECT} times! (stopping app)`);
        process.exit(0);
    }
}, 5000);

// run express application when database has connected successfully
setupTypeORM().then(() => {
    setupExpressApp(logger);
    setInterval(async () => {
        const repo = await Container.get(ChallengeRepository);
        await repo.cleanChallenges();
    }, 6*1000);
}).catch((e) => {
    logger.error("Database connection failed, exiting application...");
    logger.error(e);
    process.exit(0);
});
