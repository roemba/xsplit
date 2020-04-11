import puppeteer from "puppeteer";
import dotenv from "dotenv";
import { fork, ChildProcess } from "child_process";
import fs = require('fs');
import { performance } from 'perf_hooks';
import { deriveKeypair, sign } from "ripple-keypairs";
import fetch from "node-fetch";

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

async function logIn(): Promise<void> {
    // Get authentication
    let derivationResult = null;
    derivationResult = deriveKeypair(process.env.TEST_SECRET);

    const resp = await fetch("http://localhost:8080/api/login/challenge?username=mcTest");
    const challenge = await resp.json();

    const result = sign(challenge.challenge, derivationResult.privateKey);

    const bearerStr = Buffer.from("mcTest" + ":" + result).toString('base64');
    bearer = `bearer=${bearerStr};path=/;max-age=840;samesite=strict`;
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
    await page.click('#register-nav');
    await page.focus("#username");
    await sleep(50);
    await page.keyboard.type("mcTest");
    await page.focus("#fullName");
    await sleep(50);
    await page.keyboard.type("Mr. McTest");
    await page.focus("#email");
    await sleep(50);
    await page.keyboard.type("xplit20@yahoo.com");
    await page.focus("#secret");
    await sleep(50);
    await page.keyboard.type("ss4cbx9U3QmgDjDkf14hycjydbfFF");

    const start = performance.now();

    await Promise.all([
        page.waitForNavigation(), // The promise resolves after navigation has finished
        page.click('#register'),
    ]);

    const end = performance.now();

    fs.appendFile(__dirname +'/userRegistryTimes.txt', " " + (end-start).toString(), function (err) {
        if (err) {
            return console.log(err);
        }
    });
    
});

test('delete me', async() => {
    await logIn();
    const res = await fetch('http://localhost:' + process.env.PORT + '/api/users/deleteMe', {
        method: 'delete',
         headers: {
            cookie: bearer,
            "Content-Type": "application/json"
        },
    });
    expect(res.status).toBe(200);
    const update = await res.json();
    expect(update).toBe("User deleted");
    
});

afterAll(async () => {

    await browser.close();
    child.kill();
});