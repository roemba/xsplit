import puppeteer from "puppeteer";
import dotenv from "dotenv";
import { fork, ChildProcess } from "child_process";
import fetch from "node-fetch";
import { deriveKeypair, sign } from "ripple-keypairs";

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

async function loginAndAccount(): Promise<void> {
    await page.goto('http://localhost:' + process.env.PORT + '/login');
    
    await page.type("#userName","alice");
    await sleep(50);
    await (await page.$("#secret")).type(process.env.ALICE_SECRET);
    await page.click('#login');
    await sleep(2000);

    await page.click("#account-nav");
    await sleep(4000);
    
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
    jest.setTimeout(20000);
    page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080
    });
    context = await browser.createIncognitoBrowserContext();

    bearer = await getBearer();

    await sleep(2000);
});

test('account update full name', async () => {

    await loginAndAccount();

    // First change full name to "Full Name"
    let fullName = await page.$("#fullName");
    await fullName.click({clickCount: 3});
    await fullName.press('Backspace');
    await sleep(50);

    await page.type("#fullName","Full Name");
    await sleep(50);

    await page.click('#submitDetailsButton');
    await sleep(3000);

    let successMessage = await page.$eval("#success-save", (el) => {
        return el.innerHTML;
    });

    expect(successMessage).toBe("Account details are successfully saved!");

    let response = await fetch('http://localhost:' + process.env.PORT + '/api/users', {
        headers: {
            cookie: bearer
        }
    });

    expect(response.status).toBe(200);

    let user = await response.json();

    expect(user.private.fullName).toBe("Full Name");

    // Change full name to "First Last" and see if it has changed
    fullName = await page.$("#fullName");
    await fullName.click({clickCount: 3});
    await fullName.press('Backspace');
    await sleep(50);

    await page.type("#fullName","First Last");
    await sleep(50);

    await page.click('#submitDetailsButton');
    await sleep(3000);

    successMessage = await page.$eval("#success-save", (el) => {
        return el.innerHTML;
    });

    expect(successMessage).toBe("Account details are successfully saved!");

    response = await fetch('http://localhost:' + process.env.PORT + '/api/users', {
        headers: {
            cookie: bearer
        }
    });

    expect(response.status).toBe(200);

    user = await response.json();

    expect(user.private.fullName).toBe("First Last");

});

test('account update emailaddress', async () => {

    await loginAndAccount();

    // First change email to "fullname@testmail.com"
    let emailAddress = await page.$("#emailAddress");
    await emailAddress.click({clickCount: 3});
    await emailAddress.press('Backspace');
    await sleep(50);

    await page.type("#emailAddress","fullname@testmail.com");
    await sleep(50);

    await page.click('#submitDetailsButton');
    await sleep(3000);

    let successMessage = await page.$eval("#success-save", (el) => {
        return el.innerHTML;
    });

    expect(successMessage).toBe("Account details are successfully saved!");

    let response = await fetch('http://localhost:' + process.env.PORT + '/api/users', {
        headers: {
            cookie: bearer
        }
    });

    expect(response.status).toBe(200);

    let user = await response.json();

    expect(user.private.email).toBe("fullname@testmail.com");

    // Change email to "alice@testmail.com" and see if it has changed
    emailAddress = await page.$("#emailAddress");
    await emailAddress.click({clickCount: 3});
    await emailAddress.press('Backspace');
    await sleep(50);

    await page.type("#emailAddress","alice@testmail.com");
    await sleep(50);

    await page.click('#submitDetailsButton');
    await sleep(3000);

    successMessage = await page.$eval("#success-save", (el) => {
        return el.innerHTML;
    });

    expect(successMessage).toBe("Account details are successfully saved!");

    response = await fetch('http://localhost:' + process.env.PORT + '/api/users', {
        headers: {
            cookie: bearer
        }
    });

    expect(response.status).toBe(200);

    user = await response.json();

    expect(user.private.email).toBe("alice@testmail.com");

});

test('account update notification invert', async () => {

    await loginAndAccount();

    const checkStatus = await page.evaluate('document.getElementById("notificationsCheck").checked');
    await sleep(50);

    await page.click("#notificationsCheck");
    await sleep(50);

    const clickedCheckStatus = await page.evaluate('document.getElementById("notificationsCheck").checked');
    await sleep(50);

    expect(checkStatus).toBe(!clickedCheckStatus);

    await page.click('#submitDetailsButton');
    await sleep(3000);

    const successMessage = await page.$eval("#success-save", (el) => {
        return el.innerHTML;
    });

    expect(successMessage).toBe("Account details are successfully saved!");

    const response = await fetch('http://localhost:' + process.env.PORT + '/api/users', {
        headers: {
            cookie: bearer
        }
    });

    expect(response.status).toBe(200);

    const user = await response.json();

    expect(user.private.notifications).toBe(clickedCheckStatus);

});

test('account update empty full name', async () => {

    await loginAndAccount();

    const fullName = await page.$("#fullName");
    await fullName.click({clickCount: 3});
    await fullName.press('Backspace');

    const fullNameInput = await page.evaluate('document.getElementById("fullName").innerHTML');
    await sleep(50);

    expect(fullNameInput).toBe("");

    await page.click('#submitDetailsButton');
    await sleep(3000);

    const errorMessage = await page.$eval("#error-save", (el) => {
        return el.innerHTML;
    });

    expect(errorMessage).toBe("An error occurred, please try again.");

});

test('account update empty email', async () => {

    await loginAndAccount();
    
    const emailAddress = await page.$("#emailAddress");
    await emailAddress.click({clickCount: 3});
    await emailAddress.press('Backspace');

    const emailAddressInput = await page.evaluate('document.getElementById("emailAddress").innerHTML');
    await sleep(50);

    expect(emailAddressInput).toBe("");

    await page.click('#submitDetailsButton');
    await sleep(3000);

    const errorMessage = await page.$eval("#error-save", (el) => {
        return el.innerHTML;
    });

    expect(errorMessage).toBe("An error occurred, please try again.");

});

test('account update empty full name and email', async () => {

    await loginAndAccount();

    const fullName = await page.$("#fullName");
    await fullName.click({clickCount: 3});
    await fullName.press('Backspace');

    const fullNameInput = await page.evaluate('document.getElementById("fullName").innerHTML');

    expect(fullNameInput).toBe("");
    
    const emailAddress = await page.$("#emailAddress");
    await emailAddress.click({clickCount: 3});
    await emailAddress.press('Backspace');

    const emailAddressInput = await page.evaluate('document.getElementById("emailAddress").innerHTML');
    await sleep(50);

    expect(emailAddressInput).toBe("");

    await page.click('#submitDetailsButton');
    await sleep(3000);

    const errorMessage = await page.$eval("#error-save", (el) => {
        return el.innerHTML;
    });

    expect(errorMessage).toBe("An error occurred, please try again.");

});

test('account update not an emailaddress error', async () => {

    await loginAndAccount();

    const emailAddress = await page.$("#emailAddress");
    await emailAddress.click({clickCount: 3});
    await emailAddress.press('Backspace');

    const emailAddressInput = await page.evaluate('document.getElementById("emailAddress").innerHTML');
    await sleep(50);

    expect(emailAddressInput).toBe("");

    await page.click('#submitDetailsButton');
    await sleep(3000);

    const errorMessage = await page.$eval("#error-save", (el) => {
        return el.innerHTML;
    });

    expect(errorMessage).toBe("An error occurred, please try again.");

});

afterEach(async () => {
    await context.close();
});

afterAll(async () => {
    await browser.close();
    child.kill();
});