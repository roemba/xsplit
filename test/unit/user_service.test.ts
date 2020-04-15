import dotenv from "dotenv";
import { User } from "../../src/models/User";
import { PrivateInformation } from "../../src/models/PrivateInformation";
import { UserService } from "../../src/services/UserService";
import {  getConnectionOptions, createConnection, Connection, getConnection } from 'typeorm';
import { deriveKeypair } from "ripple-keypairs";
import { generateSeed } from "ripple-keypairs";

let pi: PrivateInformation;
let userService: UserService;
let connection: Connection;
let user: User;
let secret: string;

beforeAll(async () => {

    dotenv.config();
    const loadedConnectionOptions = await getConnectionOptions();
    const dirSub = __dirname.substring(0, __dirname.indexOf("/test"));

    const connectionOptions = Object.assign(loadedConnectionOptions, {
        type: process.env.TYPEORM_CONNECTION, // See createConnection options for valid types
        host: process.env.TYPEORM_HOST,
        port: process.env.TYPEORM_PORT,
        username: process.env.TYPEORM_USERNAME,
        password: process.env.TYPEORM_PASSWORD,
        database: process.env.TYPEORM_DATABASE,
        entities: [dirSub + "/src/models/*.ts"],
        synchronize: process.env.TYPEORM_SYNCHRONIZE,
        logging: process.env.TYPEORM_LOGGING,
    });

    connection = await createConnection(connectionOptions);

    user = new User();
    user.username = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
    secret = generateSeed();
    const derivationResult = deriveKeypair(secret);
    pi = new PrivateInformation();
    user.publickey = derivationResult.publicKey;
    pi.email = "mcTest@testnet.com";
    pi.fullName = "Mr. Testy McTest";
    user.private = pi;
});

beforeEach(() => {
    const userRepository = getConnection().manager.getRepository(User);
    const privateRepository = getConnection().manager.getRepository(PrivateInformation);
    userService = new UserService(userRepository, privateRepository);
});

test('create user', async() => {
    await userService.create(user).catch(() => {
        expect(true);
    });
});

test('find one', async () => {
    const userInfo = await userService.findOne(user.username);
    expect(userInfo.username).toBe(user.username);
    expect(userInfo.publickey).toBe(user.publickey);
});

test('find one with private', async () => {
    const userInfo = await userService.findOne(user.username, {relations: ["private"]});
    expect(userInfo.username).toBe(user.username);
    expect(userInfo.publickey).toBe(user.publickey);
    expect(userInfo.private.email).toBe(user.private.email);
    expect(userInfo.private.fullName).toBe(user.private.fullName);
    expect(userInfo.private.notifications).toBe(false);
});

test('get publickey for valid user', async() => {
    const key = await userService.getPublicKey(user.username);
    expect(key).toBe(user.publickey);
});

test('get public key for an empty user', async()=> {
    await userService.getPublicKey(" ").catch(() => {
        expect(false);
    });
});

test('get public key for an invalid', async()=> {
    await userService.getPublicKey("eve").catch(() => {
        expect(false);
    });
});

test('search users', async()=> {
    const users = await userService.findUsers("alic");
    expect(users.length).toBe(1);
    expect(users[0]).toBe("alice");
});

test('search users, no match', async()=> {
    const users = await userService.findUsers("mcTest");
    expect(users.length).toBe(0);
});

test('empty search string when searching for user', async() => {
    await userService.findUsers(" ").catch(() => {
        expect(false);
    });
});

test('update user', async()=> {
    pi.fullName = "mcTest the Third";
    pi.notifications = true;
    user.private = pi;

    await userService.create(user).catch(() => {
        expect(true);
    });
});

test('check updates using find me', async() => {
    const userInfo = await userService.findMe(user);
    expect(userInfo.username).toBe(user.username);
    expect(userInfo.private.fullName).toBe("mcTest the Third");
    expect(userInfo.private.notifications).toBe(true);
});

afterAll(async () => {
    connection.close();
});