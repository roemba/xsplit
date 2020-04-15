import puppeteer from "puppeteer";
import dotenv from "dotenv";
import { fork, ChildProcess } from "child_process";
import { deriveKeypair, sign } from "ripple-keypairs";
import fetch from "node-fetch";
import { Bill } from "../../../src/models/Bill";
import { TransactionRequest } from "../../../src/models/TransactionRequest";
import { AddBillRequest } from "../../../src/controllers/BillController";
import { plainToClass } from "class-transformer";

let browser: puppeteer.Browser;
let context: puppeteer.BrowserContext;
let page: puppeteer.Page;
let child: ChildProcess;
let bearer: string;

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}   

async function getBearer(username: string, secret: string): Promise<string> {
    let derResult = null;
    derResult = deriveKeypair(secret);

    const resp = await fetch("http://localhost:" + process.env.PORT + "/api/login/challenge?username="+username);
    const challenge = await resp.json();

    const result = sign(challenge.challenge, derResult.privateKey);

    const bearerStr = Buffer.from(username + ":" + result).toString('base64');
    return await `bearer=${bearerStr};path=/;max-age=840;samesite=strict`;
}

async function login(username: string, secret: string): Promise<void> {
    await page.goto('http://localhost:' + process.env.PORT + '/login');
    
    await page.type("#userName",username);
    await sleep(50);
    await (await page.$("#secret")).type(secret);
    await page.click('#login');
    await sleep(3000);

    return;
}

beforeAll(async () => {
    dotenv.config();
    // Run the server as a child process
    child = fork("./dist/index.js");
    browser = await puppeteer.launch();
    // Sleep to wait for child process to start up
    await sleep(4000);
});

beforeEach(async () => {
    jest.setTimeout(25000);
    page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080
    });
    context = await browser.createIncognitoBrowserContext();

    bearer = await getBearer("alice",process.env.ALICE_SECRET);

    await sleep(2000);
});

test('pay transaction', async () => {

    const bill = new AddBillRequest();
    bill.description = "Test transaction pay";
    bill.totalXrpDrops = 10;
    bill.participants = ["alice", "bob"];
    // eslint-disable-next-line
    bill.weights = [1, 1];

    let res = await fetch('http://localhost:' + process.env.PORT + '/api/bills', {
        method: "POST",
        headers: {
            cookie: bearer,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(bill)
    });
    expect(res.status).toBe(200);

    const billID = (await res.text()).replace(/"/g, "");
    await sleep(500);

    res = await fetch("http://localhost:" + process.env.PORT + "/api/bills/"+billID, {
        headers: {
            cookie: bearer
        }
    });

    await sleep(500);

    const createdBill = plainToClass(Bill, await res.json());
    const trs = createdBill.transactionRequests;
    const tr = trs.filter(t => t.debtor.username === "bob")[0];

    await login("bob",process.env.BOB_SECRET);
    getBearer("bob",process.env.BOB_SECRET);
    await sleep(2000);

    await page.click("#pay-nav");
    await sleep(4000);

    const trOnPage = await page.$$('#payment_'+tr.id);
    expect(trOnPage.length).toBe(1);

    // Check the transactionrequest in API
    res = await fetch('http://localhost:' + process.env.PORT + '/api/transactions/'+tr.id, {
        headers: {
            cookie: bearer
        }
    });

    let tx = plainToClass(TransactionRequest, await res.json());

    expect(tx.paid).toBe(false);

    const buttonIdentifier = tx.id+"_5_02C90CDEDE88AFD56FF51A41DDF8B12EB0380D3F4D21D2BB6CD15E64FEB25358F6";
    await page.click("button[id='"+buttonIdentifier+"']");
    await sleep(8000);

    const noTxOnPage = await page.$$('#payment_'+tr.id);
    expect(noTxOnPage.length).toBe(0);

    // Check the transactionrequest in API
    res = await fetch('http://localhost:' + process.env.PORT + '/api/transactions/'+tr.id, {
        headers: {
            cookie: bearer
        }
    });

    tx = plainToClass(TransactionRequest, await res.json());

    expect(tx.paid).toBe(true);

});

afterEach(async () => {
    await context.close();
});

afterAll(async () => {
    await browser.close();
    child.kill();
});