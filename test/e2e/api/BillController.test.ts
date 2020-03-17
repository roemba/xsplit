import dotenv from "dotenv";
import { fork, ChildProcess } from "child_process";
import fetch from "node-fetch";
import { plainToClass } from "class-transformer";
import { Bill } from "../../../src/models/Bill";
import { User } from "../../../src/models/User";

let child: ChildProcess;

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}   

beforeAll(async () => {
    dotenv.config();
    // Run the server as a child process
    child = fork("./dist/index.js");
    // Sleep to wait for child process to start up
    await sleep(4000);
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
            cookie: "bearer=YWxpY2U6MzA0NDAyMjAzRkIyNzBCMTQ3QTg4MEFCQ0Y2NjUyODcyMzU4RTdDNzVDMDkwREI5NDE0M0NDMzVDRkUxNzJBRDNGNURBOTM3MDIyMDZDQ0VERkMwNzRCNTk3N0M0RkJFRkU5RTg1NzNBQzgyMEFCRTc4RjI0RUMwMDBBQzQzNjFERDJDQjZBMjRCMkQ=",
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

afterAll(async () => {
    child.kill();
});