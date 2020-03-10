import dotenv from "dotenv";
import path from "path";
// Import reflect-metadata npm package necessary for class-transformer and routing-controller to function
import "reflect-metadata";
import { createExpressServer } from "routing-controllers";
import winston from "winston";
import { Container } from "typedi";
import { setupTypeORM } from "./typeORMLoader";
import { useContainer } from "typeorm";
import { RippleLibService } from "./services/RippleLibService";
import * as express from 'express';
import { authorizationChecker } from "./auth/AuthorizationChecker";
import { currentUserChecker } from "./auth/CurrentUserChecker";
import {ChallengeRepository} from "./repositories/ChallengeRepository";

// Set up the typeorm and typedi integration
useContainer(Container);

// Create a basic logger that logs to console
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console({
            level: 'debug',
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.simple()
            )
        })
      ]
});

// Initialise the dotenv environment
dotenv.config();

// Initialise the ripple-lib service
Container.get(RippleLibService).init().then(() => {
    logger.info("Connected to ripple");
}).catch(() => {
    logger.error("Connecting to ripple failed");
    process.exit(0);
});

// run express application when database has connected succesfully
setupTypeORM().then(() => {
    // creates express app, registers all controller routes and returns express app instance
    const app = createExpressServer({
        controllers: [__dirname + "/controllers/*.js"], // we specify controllers we want to use, .js because it points to compiled files
        middlewares: [__dirname + "/middlewares/*.js"],
        defaultErrorHandler: false,
        authorizationChecker: authorizationChecker(),
        currentUserChecker: currentUserChecker(),
        
    });
    const port = process.env.PORT || 8080; // get port from env, otherwise take default
    
    // Configure Express to use EJS
    app.set( "views", path.join( __dirname, "views" ) );
    app.set( "view engine", "ejs" );

    app.use("/assets", express.static(path.join(__dirname, "assets")));
    app.use("/events", express.static(path.join(__dirname, "events")));

    app.listen(port, () => {
        logger.info("App started, listening on port " + port);
    }); 
}).catch((e) => {
    setInterval(Container.get(ChallengeRepository).cleanChallenges, 60*1000)
    logger.error("Database connection failed, exiting application...");
    logger.error(e);
    process.exit(0);
});
