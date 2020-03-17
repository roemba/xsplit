import puppeteer from "puppeteer";
import dotenv from "dotenv";
import { fork, ChildProcess } from "child_process";
import { generateSeed } from "ripple-keypairs";

let browser: puppeteer.Browser;
let context: puppeteer.BrowserContext;
let page: puppeteer.Page;
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

test('register', async () => {
    await page.goto('http://localhost:' + process.env.PORT);
    const header = await page.$eval("h1", (el) => {
        return el.innerHTML;
    });
    expect(header).toBe("Stop worrying about expenses!");
    await page.click('#register-nav');
    const registerHeader = await page.$eval("h1", (el) => {
        return el.innerHTML;
    });
    expect(registerHeader).toBe("Register");
    const genUsername = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
    await page.focus("#username");
    await sleep(50);
    await page.keyboard.type(genUsername);
    const secret = generateSeed();
    await page.focus("#secret");
    await sleep(50);
    await page.keyboard.type(secret);
    await page.click('#register');
    await sleep(8000);
    const loginHeader = await page.$eval("h1", (el) => {
        return el.innerHTML;
    });
    expect(loginHeader).toBe("Login");
});

test('login', async () => {
    await page.goto('http://localhost:' + process.env.PORT);
    const noCookies = await page.cookies();
    expect(noCookies.length).toBe(0);
    const header = await page.$eval("h1", (el) => {
        return el.innerHTML;
    });
    expect(header).toBe("Stop worrying about expenses!");
    await page.click('#login-nav');
    const loginHeader = await page.$eval("h1", (el) => {
        return el.innerHTML;
    });
    expect(loginHeader).toBe("Login");
    await page.focus("#userName");
    await sleep(50);
    await page.keyboard.type("alice");
    await (await page.$("#secret")).type(process.env.ALICE_SECRET);
    await page.click('#login');
    await sleep(500);
    const headerHome = await page.$eval("h1", (el) => {
        return el.innerHTML;
    });
    expect(headerHome).toBe("Stop worrying about expenses!");
    const cookies = await page.cookies();
    expect(cookies.length).toBe(1);
    expect(cookies[0].name).toBe("bearer");
});

afterEach(async () => {
    await context.close();
});

afterAll(async () => {
    await browser.close();
    child.kill();
});