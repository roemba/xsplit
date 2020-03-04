import dotenv from "dotenv";
import winston from "winston";
import { Container } from "typedi";
import { User } from "../models/User";
import { UserService } from "../services/UserService";
import { getConnectionOptions, createConnection, useContainer } from "typeorm";
import * as fs from "fs";


const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
      ]
});

useContainer(Container);
dotenv.config();

async function addUser(username: string, publickey: string): Promise<User> {
    const user = new User();
    user.username = username;
    user.publickey = publickey;
    return Container.get(UserService).create(user);
}

async function setupTypeORM(): Promise<void> {
    const loadedConnectionOptions = await getConnectionOptions();

    const connectionOptions = Object.assign(loadedConnectionOptions, {
        type: process.env.TYPEORM_CONNECTION, // See createConnection options for valid types
        host: process.env.TYPEORM_HOST,
        port: process.env.TYPEORM_PORT,
        username: process.env.TYPEORM_USERNAME,
        password: process.env.TYPEORM_PASSWORD,
        database: process.env.TYPEORM_DATABASE,
        synchronize: process.env.TYPEORM_SYNCHRONIZE,
        logging: process.env.TYPEORM_LOGGING,
        entities: [__dirname + "/../models/*.ts"],
    });

    await createConnection(connectionOptions);
}

setupTypeORM().then(() => {
    logger.info("Connected to db!");

    // add test user to db
    addUser("Bob", "ABC123").then(() => {
        logger.info("Added new user to db!");
    }).catch((e) => {
        logger.error("Adding new user to db failed: " + e);
    })

}).catch((e) => {
    logger.error("Db connection failed with error: " + e);
});