import dotenv from "dotenv";
import { Container } from "typedi";
import { User } from "../src/models/User";
import { UserService } from "../src/services/UserService";
import { LoggerService } from "../src/services/LoggerService";
import { getConnectionOptions, createConnection, useContainer } from "typeorm";
import { PrivateInformation } from "../src/models/PrivateInformation";


const logger = Container.get(LoggerService);

useContainer(Container);
dotenv.config();

async function addUser(username: string, publickey: string, email: string, fullName: string): Promise<void> {
    const user = new User();
    user.username = username;
    user.private = new PrivateInformation();
    user.private.publickey = publickey;
    user.private.email = email;
    user.private.fullName = fullName;
    try {
        await Container.get(UserService).create(user);
        logger.info("Added new user to db!");
    } catch(e) {
        if (e.name === "QueryFailedError" && e.detail.includes("already exists")) {
            logger.info("User already exists in the db!");
        } else {
            logger.error("Error occurred!");
            logger.error(e);
        }
    }
}

async function seedDB(): Promise<void> {
    // tests users
    const users = {
        "alice": {
            "username": "alice",
            "publickey": "02C90CDEDE88AFD56FF51A41DDF8B12EB0380D3F4D21D2BB6CD15E64FEB25358F6",
            "email": "xplit20@yahoo.com",
            "name": "Alice"
        },
        "bob": {
            "username": "bob",
            "publickey": "02247DCA3727D848340F1520968A2191D3AC8F1299AFC7291969E6845AC7CFB579",
            "email": "xplit20@yahoo.com",
            "name": "Bob"
        }
    };

    // add test users to db
    await addUser(users.alice.username, users.alice.publickey, users.alice.email, users.alice.name);
    await addUser(users.bob.username, users.bob.publickey, users.bob.email, users.bob.name);
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
        entities: [__dirname + "/../src/models/*.ts"],
    });

    await createConnection(connectionOptions);
}

setupTypeORM().then(() => {
    logger.info("Connected to db!");

    seedDB().then(() => {
        logger.info("Done seeding the db!");
    });

}).catch((e) => {
    logger.error("Db connection failed with error: " + e);
});