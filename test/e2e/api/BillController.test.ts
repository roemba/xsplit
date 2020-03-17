import dotenv from "dotenv";
import { fork, ChildProcess } from "child_process";
import fetch from "node-fetch";
import { plainToClass } from "class-transformer";
import { Bill } from "../../../src/models/Bill";
import { User } from "../../../src/models/User";
import { deriveKeypair, sign } from "ripple-keypairs";

let child: ChildProcess;

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

let bearer: string;

beforeAll(async () => {
    dotenv.config();
    // Run the server as a child process
    child = fork("./dist/index.js");
    // Sleep to wait for child process to start up
    await sleep(4000);

    // Get authentication
    let derivationResult = null;
    derivationResult = deriveKeypair(process.env.ALICE_SECRET);

    const resp = await fetch("http://localhost:8080/api/login/challenge?username=alice");
    const challenge = await resp.text();

    const result = sign(challenge, derivationResult.privateKey);

    const bearerStr = Buffer.from("alice" + ":" + result).toString('base64');
    bearer = `bearer=${bearerStr};path=/;max-age=840;samesite=strict`;
});

test('create bill', async () => {
    const bill = new Bill();
    bill.description = "test bill";
    bill.totalXrp = 100;
    const alice = new User();
    alice.username = "alice";
    const bob = new User();
    bob.username = "bob";
    bill.participants = [alice, bob];
    // TODO fix: Uses hardcoded alice cookie to authenticate for now
    const res = await fetch('http://localhost:' + process.env.PORT + '/api/bills', {
        method: 'post',
         headers: {
            cookie: bearer,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(bill)
    });
    expect(res.status).toBe(200);
    const createdBill = plainToClass(Bill, await res.json());
    expect(createdBill.totalXrp).toBe("100");
    expect(createdBill.description).toBe("test bill");
    expect(createdBill.participants.length).toBe(2);
    expect(createdBill.transactionRequests.length).toBe(2);
    // TODO fix: Since current implementation uses alice's cookie to authenticate
    expect(createdBill.creditor.username).toBe("alice");
});

test('get my bills', async () => {
    // TODO fix: Uses hardcoded alice cookie to authenticate for now
    const res = await fetch('http://localhost:' + process.env.PORT + '/api/bills', {
         headers: {
            cookie: bearer
        },
    });
    expect(res.status).toBe(200);
    const createdBills: Bill[] = plainToClass(Bill, await res.json() as Array<unknown>);
    expect(createdBills.length).toBeGreaterThan(0);
    // TODO fix: Alice hardcoded here
    // Check if all retrieved bills are actually created by alice
    for (let i = 0; i < createdBills.length; i++) {
        expect(createdBills[i].creditor.username).toBe("alice");
    }
});

afterAll(async () => {
    child.kill();
});