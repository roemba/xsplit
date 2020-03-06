import dotenv from "dotenv";
import winston from "winston";
import { Container } from "typedi";
import { User } from "../models/User";
import { UserService } from "../services/UserService";
import { getConnectionOptions, createConnection, useContainer } from "typeorm";


const logger = winston.createLogger({
    transports: [
        new winston.transports.Console()
      ]
});

useContainer(Container);
dotenv.config();

async function addUser(username: string, publickey: string, email: string, fullName: string): Promise<User> {
    const user = new User();
    user.username = username;
    user.publickey = publickey;
    user.email = email;
    user.fullName = fullName;
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

    // tests users
    const users = {
        "alice": {
            "username": "alice",
            "publickey": "02C90CDEDE88AFD56FF51A41DDF8B12EB0380D3F4D21D2BB6CD15E64FEB25358F6",
            "email": "alice@xsplit.com",
            "name": "Alice"
        },
        "bob": {
            "username": "bob",
            "publickey": "02247DCA3727D848340F1520968A2191D3AC8F1299AFC7291969E6845AC7CFB579",
            "email": "bob@xsplit.com",
            "name": "Bob"
        }
    }

    // add test users to db
    addUser(users.alice.username, users.alice.publickey, users.alice.email, users.alice.name);
    addUser(users.bob.username, users.bob.publickey, users.bob.email, users.bob.name);

    logger.info("Done seeding the db!");

}).catch((e) => {
    logger.error("Db connection failed with error: " + e);
});