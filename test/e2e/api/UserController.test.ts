import dotenv from "dotenv";
import { fork, ChildProcess } from "child_process";
import fetch from "node-fetch";
import { plainToClass } from "class-transformer";
import { User } from "../../../src/models/User";
import { deriveKeypair, sign } from "ripple-keypairs";
import { generateSeed } from "ripple-keypairs";

let child: ChildProcess;
let bearer: string;
let username: string;
let secret: string;
jest.setTimeout(30000);

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

async function logIn(): Promise<void> {
    // Get authentication
    let derivationResult = null;
    derivationResult = deriveKeypair(secret);

    const resp = await fetch(`http://localhost:` + process.env.PORT + `/api/login/challenge?username=${username}`);
    const challenge = await resp.json();

    const result = sign(challenge.challenge, derivationResult.privateKey);

    const bearerStr = Buffer.from(username + ":" + result).toString('base64');
    bearer = `bearer=${bearerStr};path=/;max-age=840;samesite=strict`;
}

beforeAll(async () => {
    dotenv.config();
    // Run the server as a child process
    child = fork("./dist/index.js");
    // Sleep to wait for child process to start up
    await sleep(4000);
});

test('create user', async() => {
    username = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
    secret = generateSeed();
    const derivationResult = deriveKeypair(secret);
    const publickey = derivationResult.publicKey;
    const email = "mcTest@testnet.com";
    const fullName = "Mr. Testy McTest";

    const res = await fetch('http://localhost:' + process.env.PORT + '/api/users', {
        method: 'post',
         headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
			username,
			email,
			fullName,
			publickey
		})
    });

    expect(res.status).toBe(200);
    const createdUser = plainToClass(User, await res.json());
    expect(createdUser.username).toBe(username);
    expect(createdUser.publickey).toBe(derivationResult.publicKey);
    expect(createdUser.private.email).toBe("mcTest@testnet.com");
    expect(createdUser.private.fullName).toBe("Mr. Testy McTest");

});

test('create invalid user', async() => {
    const username = "eve";
    const publickey = "";
    const email = "eve@evil.com";
    const fullName = "Eve";

    const res = await fetch('http://localhost:' + process.env.PORT + '/api/users', {
        method: 'post',
         headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
			username,
			email,
			fullName,
			publickey
		})
    });

    expect(res.status).toBe(400);
});

test('get me', async() => {
    await logIn();
    sleep(4000);
    const response = await fetch('http://localhost:' + process.env.PORT + '/api/users', {
        method: "GET",
        headers: {
            cookie: bearer,
            "Content-Type": "application/json"
        },
    });
    expect(response.status).toBe(200);
    const currentUser = plainToClass(User, await response.json());
    const derivationResult = deriveKeypair(secret);

    expect(currentUser.username).toBe(username);
    expect(currentUser.publickey).toBe(derivationResult.publicKey);
    expect(currentUser.private.email).toBe("mcTest@testnet.com");
    expect(currentUser.private.fullName).toBe("Mr. Testy McTest");
    expect(currentUser.private.notifications).toBe(false);
});

test('update user info', async() => {
    const notifications = true;
    const fullName = "McTest the Third";
    const email = "testing@mcTest.com";

    const res = await fetch('http://localhost:' + process.env.PORT + '/api/users', {
        method: 'put',
         headers: {
            cookie: bearer,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
			email,
            fullName,
            notifications
		})
    });

    expect(res.status).toBe(200);
    const update = await res.json();
    expect(update).toBe('User updated');

});

test('search for user', async() => {
    const res = await fetch('http://localhost:' + process.env.PORT + '/api/users/search/alie', {
        method: 'get',
         headers: {
            cookie: bearer,
            "Content-Type": "application/json"
        },
    });
    expect(res.status).toBe(200);
    const updatedUser = await res.json();
    expect(updatedUser.length).toBe(1);

});

afterAll(async () => {
    child.kill();
});