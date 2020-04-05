import puppeteer from "puppeteer";
import dotenv from "dotenv";
import { fork, ChildProcess } from "child_process";
import { deriveKeypair, sign } from "ripple-keypairs";
import fetch from "node-fetch";
import { Bill } from "../../../src/models/Bill";

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

async function getBearer(): Promise<string> {
    let derResult = null;
    derResult = deriveKeypair(process.env.ALICE_SECRET);

    const resp = await fetch("http://localhost:" + process.env.PORT + "/api/login/challenge?username=alice");
    const challenge = await resp.json();

    const result = sign(challenge.challenge, derResult.privateKey);

    const bearerStr = Buffer.from("alice" + ":" + result).toString('base64');
    return await `bearer=${bearerStr};path=/;max-age=840;samesite=strict`;
}

async function login(): Promise<void> {
    await page.goto('http://localhost:' + process.env.PORT + '/login');
    
    await page.type("#userName","alice");
    await sleep(50);
    await (await page.$("#secret")).type(process.env.ALICE_SECRET);
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

    bearer = await getBearer();

    await sleep(2000);
});

test('request two equal weight users (include me)', async () => {

    await login();

    await page.click("#request-nav");
    await sleep(2000);

    await page.type("#subject","Test case 1 subject");
    await sleep(50);
    await page.type("#amount","1.00");
    await sleep(50);
    await page.type("#user-search","bob");
    await sleep(2000);
    await page.keyboard.press("ArrowDown");
    await sleep(1000);
    await page.keyboard.press("Enter");
    await sleep(1000);
    await page.click("#includeCheck");
    await sleep(1000);
    await page.click('#submitBill');
    await sleep(4000);

    const successMessage = await page.evaluate('document.getElementById("bill-success").innerText');
    expect(successMessage).toBe("Bill created and sent to users!");

    // Check contents of added bill in API
    const response = await fetch('http://localhost:' + process.env.PORT + '/api/bills', {
        headers: {
            cookie: bearer
        }
    });

    expect(response.status).toBe(200);

    const bills: Bill[] = await response.json();
    expect(bills.length).toBeGreaterThan(0);

    bills.sort((a, b) => a.dateCreated > b.dateCreated ? - 1 : Number(a.dateCreated < b.dateCreated));

    const bill = bills[0];

    expect(bill.description).toBe("Test case 1 subject");
    expect(bill.creditor.username).toBe("alice");
    expect(bill.totalXrpDrops).toBe(1000000);
    expect(bill.participants.length).toBe(2);

    const weightAlice = bill.weights[0].weight;
    const weightBob = bill.weights[1].weight;

    expect(weightAlice).toBe(1);
    expect(weightBob).toBe(1);

});

test('request two not equal weight users (include me)', async () => {

    await login();

    await page.click("#request-nav");
    await sleep(2000);

    await page.type("#subject","Test case 2 subject");
    await sleep(50);
    await page.type("#amount","2.00");
    await sleep(50);
    await page.click("#includeCheck");
    await sleep(2000);

    await page.type("#user-search","bob");
    await sleep(2000);
    await page.keyboard.press("ArrowDown");
    await sleep(2000);
    await page.keyboard.press("Enter");
    await sleep(2000);

    await page.select("select#select-bob","2");
    await sleep(500);

    await page.click('#submitBill');
    await sleep(4000);

    const successMessage = await page.evaluate('document.getElementById("bill-success").innerText');
    expect(successMessage).toBe("Bill created and sent to users!");

    // Check contents of added bill in API
    const response = await fetch('http://localhost:' + process.env.PORT + '/api/bills', {
        headers: {
            cookie: bearer
        }
    });

    expect(response.status).toBe(200);

    const bills: Bill[] = await response.json();
    expect(bills.length).toBeGreaterThan(0);

    bills.sort((a, b) => a.dateCreated > b.dateCreated ? - 1 : Number(a.dateCreated < b.dateCreated));

    const bill = bills[0];

    expect(bill.description).toBe("Test case 2 subject");
    expect(bill.creditor.username).toBe("alice");
    expect(bill.totalXrpDrops).toBe(2000000);
    expect(bill.participants.length).toBe(2);

    let weightAlice, weightBob = 0;

    bill.weights.forEach(billWeight => {
        if(billWeight.user.username === "alice") {
            weightAlice = billWeight.weight;
        }else if(billWeight.user.username === "bob") {
            weightBob = billWeight.weight;
        }
    });

    expect(weightAlice).toBe(1);
    expect(weightBob).toBe(2);
    
});

test('button disabled if no subject, amount or users included', async () => {

    await login();

    await page.click("#request-nav");
    await sleep(2000);

    await page.click('#submitBill');
    await sleep(4000);

    const successMessage = await page.evaluate('document.getElementById("bill-success").innerText');
    expect(successMessage).toBe("");

    const errorMessage = await page.evaluate('document.getElementById("bill-error").innerText');
    expect(errorMessage).toBe("");

    const buttonDisabled = await page.evaluate(() => document.querySelector('button#submitBill[disabled]') !== null);
    expect(buttonDisabled).toBe(true);
});

test('view all bills, count settled and unsettled', async () => {

    await login();

    await page.click("#bills-nav");
    await sleep(4000);

    // Check contents of added bill in API
    const response = await fetch('http://localhost:' + process.env.PORT + '/api/bills', {
        headers: {
            cookie: bearer
        }
    });

    expect(response.status).toBe(200);

    const bills: Bill[] = await response.json();

    // Total bills on page
    const billItemsOnPage = await page.$$('.bill-item');
    await sleep(50);
    expect(bills.length).toBe(billItemsOnPage.length);

    // Differentiate between settled and unsettled bills
    let settledCount = 0;

    bills.forEach(bill => {
        let allPaid = true;
        bill.transactionRequests.forEach(tr => {
            if(!tr.paid && allPaid) {
                allPaid =  false;
            }
        });
        if(allPaid) {
            settledCount += 1;
        }
    });

    const settledBillsOnPage = await page.$$('.settled-bills .bill-item');
    const unsettledBillsOnPage = await page.$$('.unsettled-bills .bill-item');
    
    expect(settledCount).toBe(settledBillsOnPage.length);
    expect(bills.length-settledCount).toBe(unsettledBillsOnPage.length);

});

afterEach(async () => {
    await context.close();
});

afterAll(async () => {
    await browser.close();
    child.kill();
});