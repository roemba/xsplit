import { createExpressServer } from "routing-controllers";
import { authorizationChecker } from "./auth/AuthorizationChecker";
import { currentUserChecker } from "./auth/CurrentUserChecker";
import path from "path";
import * as express from 'express';
import { LoggerService } from "./services/LoggerService";

export async function setupExpressApp(logger?: LoggerService): Promise<void> {
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
        if (logger) {
            logger.info("App started, listening on port " + port);
        }
    });
}