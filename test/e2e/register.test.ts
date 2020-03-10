import puppeteer from "puppeteer";
import dotenv from "dotenv";
import { fork, ChildProcess } from 'child_process';

let browser: puppeteer.Browser;
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
    page = await browser.newPage();
});

test('test', async () => {
    await page.goto('http://localhost:' + process.env.PORT);
    const header = await page.$eval("h1", (el) => {
        return el.innerHTML;
    });
    expect(header).toBe("Stop worrying about expenses!");
});

afterAll(async () => {
    await browser.close();
    child.kill();
});