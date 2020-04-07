import dotenv from "dotenv";
import { fork, ChildProcess } from "child_process";
import fetch from "node-fetch";
import { plainToClass } from "class-transformer";
import { AddBillRequest } from "../../../src/controllers/BillController";
import { deriveKeypair, sign } from "ripple-keypairs";
import { Bill } from "../../../src/models/Bill";

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
    const challenge = await resp.json();

    const result = sign(challenge.challenge, derivationResult.privateKey);

    const bearerStr = Buffer.from("alice" + ":" + result).toString('base64');
    bearer = `bearer=${bearerStr};path=/;max-age=840;samesite=strict`;
});

test('create bill', async () => {
    const bill = new AddBillRequest();
    bill.description = "test bill";
    bill.totalXrpDrops = 100;
    bill.participants = ["alice", "bob"];
    // eslint-disable-next-line
    bill.weights = [1, 1];

    const res = await fetch('http://localhost:' + process.env.PORT + '/api/bills', {
        method: 'post',
         headers: {
            cookie: bearer,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(bill)
    });
    expect(res.status).toBe(200);
    const createdId = (await res.text()).replace(/"/g, "");
    const getBill = await fetch('http://localhost:' + process.env.PORT + '/api/bills/' + createdId, {
        method: 'get',
         headers: {
            cookie: bearer,
        },
    });
    const createdBill = plainToClass(Bill, await getBill.json());
    expect(createdBill.totalXrpDrops).toBe(100);
    expect(createdBill.description).toBe("test bill");
    expect(createdBill.participants.length).toBe(2);
    expect(createdBill.transactionRequests.length).toBe(2);
    expect(createdBill.creditor.username).toBe("alice");
});

test('get my bills', async () => {
    const res = await fetch('http://localhost:' + process.env.PORT + '/api/bills', {
         headers: {
            cookie: bearer
        },
    });
    expect(res.status).toBe(200);
    const createdBills: Bill[] = plainToClass(Bill, await res.json() as Array<unknown>);
    expect(createdBills.length).toBeGreaterThan(0);
    // Check if all retrieved bills are actually created by alice
    for (let i = 0; i < createdBills.length; i++) {
        expect(createdBills[i].creditor.username).toBe("alice");
    }
});

test('get bills, then remove first bill', async () => {
    const billsRequest = await fetch('http://localhost:' + process.env.PORT + '/api/bills', {
         headers: {
            cookie: bearer
        },
    });
    expect(billsRequest.status).toBe(200);
    const foundBills: Bill[] = plainToClass(Bill, await billsRequest.json() as Array<unknown>);
    expect(foundBills.length).toBeGreaterThan(0);

    const id = foundBills[0].id;
    const deleteRequest = await fetch('http://localhost:' + process.env.PORT + '/api/bills/' + id, {
        method: 'delete',
        headers: {
            cookie: bearer
        },
    });
    expect(deleteRequest.status).toBe(200);

    const afterDelete = await fetch('http://localhost:' + process.env.PORT + '/api/bills', {
         headers: {
            cookie: bearer
        },
    });
    expect(afterDelete.status).toBe(200);
    const foundBillsAfterDelete: Bill[] = plainToClass(Bill, await afterDelete.json() as Array<unknown>);
    expect(foundBillsAfterDelete.length).toBe(foundBills.length - 1);
    for(const b of foundBillsAfterDelete) {
        expect(b.id).not.toBe(id);
    }
});

afterAll(async () => {
    child.kill();
});