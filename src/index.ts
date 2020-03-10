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
Container.get(RippleLibService).init().then(() => {
    logger.info("Connected to ripple");
}).catch(() => {
    logger.error("Connecting to ripple failed");
    process.exit(0);
});

// run express application when database has connected succesfully
setupTypeORM().then(() => {
    setupExpressApp(logger);
}).catch((e) => {
    setInterval(Container.get(ChallengeRepository).cleanChallenges, 60*1000);
    logger.error("Database connection failed, exiting application...");
    logger.error(e);
    process.exit(0);
});
