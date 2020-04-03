import puppeteer from "puppeteer";
import dotenv from "dotenv";
import { fork, ChildProcess } from "child_process";

let browser: puppeteer.Browser;
let context: puppeteer.BrowserContext;
let page: puppeteer.Page;
let child: ChildProcess;

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}   

async function login() {
    await page.goto('http://localhost:' + process.env.PORT + '/login');
    
    await page.focus("#userName");
    await sleep(50);
    await page.keyboard.type("alice");
    await (await page.$("#secret")).type(process.env.ALICE_SECRET);
    await page.click('#login');
    await sleep(2000);

    await page.click("#account-nav");
    await sleep(2000);
    const accountHeader = await page.$eval("h1", (el) => {
        return el.innerHTML;
    });

    expect(accountHeader).toBe("My Account");

    await sleep(3000);
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
    jest.setTimeout(15000);
    page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080
    });
    context = await browser.createIncognitoBrowserContext();
});

test('account update full name', async () => {

    await login()

    let searchInput = await page.$("#fullName");
    await searchInput.click({clickCount: 3});
    await searchInput.press('Backspace');

    await sleep(50);
    await page.type("#fullName","First Last");
    await sleep(50);

    await page.click('#submitDetailsButton');
    await sleep(3000);

    const successMessage = await page.$eval("#success-save", (el) => {
        return el.innerHTML;
    });

    expect(successMessage).toBe("Account details are successfully saved!");

});

test('account update emailaddress', async () => {

    await login();

    let searchInput = await page.$("#emailAddress");
    await searchInput.click({clickCount: 3});
    await searchInput.press('Backspace');
    await sleep(50);
    await page.type("#emailAddress","alice@gmail.com");
    await sleep(50);
    await page.click('#submitDetailsButton');
    await sleep(3000);

    const successMessage = await page.$eval("#success-save", (el) => {
        return el.innerHTML;
    });

    expect(successMessage).toBe("Account details are successfully saved!");

});

test('account update notification invert', async () => {

    await login();

    await page.click("#notificationsCheck");
    await sleep(50);
    await page.click('#submitDetailsButton');
    await sleep(3000);

    const successMessage = await page.$eval("#success-save", (el) => {
        return el.innerHTML;
    });

    expect(successMessage).toBe("Account details are successfully saved!");

});

test('account update full name empty error', async () => {

    await login()

    let searchInput = await page.$("#fullName");
    await searchInput.click({clickCount: 3});
    await searchInput.press('Backspace');

    await page.click('#submitDetailsButton');
    await sleep(3000);

    const errorMessage = await page.$eval("#error-save", (el) => {
        return el.innerHTML;
    });

    expect(errorMessage).toBe("An error occurred, please try again.");

});

test('account update not an emailaddress error', async () => {

    await login();

    let searchInput = await page.$("#emailAddress");
    await searchInput.click({clickCount: 3});
    await searchInput.press('Backspace');
    await sleep(50);
    await page.type("#emailAddress","alice");
    await sleep(50);
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