import dotenv from "dotenv";
import { fork, ChildProcess } from "child_process";
import fetch from "node-fetch";
import { plainToClass } from "class-transformer";
import { AddBillRequest } from "../../../src/controllers/BillController";
import { deriveKeypair, sign } from "ripple-keypairs";
import { Bill } from "../../../src/models/Bill";
import { TransactionRequest } from "../../../src/models/TransactionRequest";
import { RippleAPI } from "ripple-lib";
import rippleKey from "ripple-keypairs";

let child: ChildProcess;
let bobPaymentRequest: TransactionRequest;

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
let bearer: string;

async function logIn(username: string, secret: string): Promise<void> {
    let derivationResult = null;
    derivationResult = deriveKeypair(secret);

    const resp = await fetch(`http://localhost:8080/api/login/challenge?username=${username}`);
    const challenge = await resp.json();

    const result = sign(challenge.challenge, derivationResult.privateKey);

    const bearerStr = Buffer.from(username + ":" + result).toString('base64');
    bearer = `bearer=${bearerStr};path=/;max-age=840;samesite=strict`;
    return;
}

beforeAll(async () => {
    dotenv.config();
    // Run the server as a child process
    child = fork("./dist/index.js");
    // Sleep to wait for child process to start up
    await sleep(4000);
});

test('create bill', async () => {
    await logIn("alice", "shuyG7PvB8fgvur1eYrxTyVMqTUN8");
    const bill = new AddBillRequest();
    bill.description = "test transactions";
    bill.totalXrpDrops = 10;
    bill.participants = ["alice", "bob"];
    // eslint-disable-next-line
    bill.weights = [1, 1];

    const res = await fetch('http://localhost:' + process.env.PORT + '/api/bills', {
        method: 'POST',
         headers: {
            cookie: bearer,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(bill)
    });
    expect(res.status).toBe(200);
    const createdId = (await res.text()).replace(/"/g, "");
    const getBill = await fetch('http://localhost:' + process.env.PORT + '/api/bills/' + createdId, {
        method: 'GET',
         headers: {
            cookie: bearer,
        },
    });
    const createdBill = plainToClass(Bill, await getBill.json());
    for(const request of createdBill.transactionRequests) {
        if(request.debtor.username == "bob") {
            bobPaymentRequest = request;
        }
    }
});

test('get my transaction requests', async () => {
    const res = await fetch('http://localhost:' + process.env.PORT + '/api/transactions', {
        method: 'GET',
        headers: {
            cookie: bearer
        },
    });

    expect(res.status).toBe(200);
    const fetchedTransactionRequests: TransactionRequest[] = plainToClass(TransactionRequest, await res.json() as Array<unknown>);
    const transactionRequest = fetchedTransactionRequests[0];
    expect(transactionRequest.creditor.username).toBe("alice");
    expect(transactionRequest.debtor.username).toBe("alice");
    expect(transactionRequest.paid).toBe(true);
    
});

test('get a transaction request', async() => {
    const res = await fetch('http://localhost:' + process.env.PORT + '/api/transactions/'+ bobPaymentRequest.id, {
        method:'GET',
         headers: {
            cookie: bearer
        },
    });
    expect(res.status).toBe(200);
    const transaction: TransactionRequest = plainToClass(TransactionRequest, await res.json());
    expect(transaction.creditor.username).toBe("alice");
    expect(transaction.debtor.username).toBe("bob");
    expect(transaction.totalXrpDrops).toBe(5);
    expect(transaction.paid).toBe(false);

});

test('set bob to paid', async() => {
    const res = await fetch('http://localhost:' + process.env.PORT + '/api/transactions/paid/' + bobPaymentRequest.id, {
        method: 'PUT',
         headers: {
            cookie: bearer
        },
    });
    expect(res.status).toBe(200);
    const transaction: TransactionRequest = plainToClass(TransactionRequest, await res.json());
    expect(transaction.id).toBe(bobPaymentRequest.id);
    expect(transaction.paid).toBe(true);
});

test('create bill', async () => {
    const bill = new AddBillRequest();
    bill.description = "test bob paying";
    bill.totalXrpDrops = 10;
    bill.participants = ["alice", "bob"];
    // eslint-disable-next-line
    bill.weights = [1, 1];

    const res = await fetch('http://localhost:' + process.env.PORT + '/api/bills', {
        method: 'POST',
         headers: {
            cookie: bearer,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(bill)
    });
    expect(res.status).toBe(200);
    const createdId = (await res.text()).replace(/"/g, "");
    const getBill = await fetch('http://localhost:' + process.env.PORT + '/api/bills/' + createdId, {
        method: 'GET',
         headers: {
            cookie: bearer,
        },
    });
    const createdBill = plainToClass(Bill, await getBill.json());
    for(const request of createdBill.transactionRequests) {
        if(request.debtor.username == "bob") {
            bobPaymentRequest = request;
        }
    }
});

test('bob pays using xrp', async() => {
    jest.setTimeout(20000);
    const bobDerivation = deriveKeypair("sh7J1WvNuJUsHBzjt7BWgULzG2QeZ");
    await logIn("bob", "sh7J1WvNuJUsHBzjt7BWgULzG2QeZ");

    const transaction = {
        Account: rippleKey.deriveAddress(bobDerivation.publicKey),
        TransactionType: "Payment",
        Amount: bobPaymentRequest.totalXrpDrops + "",
        Destination: rippleKey.deriveAddress(bobPaymentRequest.creditor.publickey)
    };
    let signedTransaction;
    try {
        const api = new RippleAPI({server: process.env.RIPPLE_SERVER});
        await api.connect();
        const preparedTransaction = await api.prepareTransaction(transaction);
        signedTransaction = api.sign(preparedTransaction.txJSON, process.env.BOB_SECRET);
        await api.submit(signedTransaction.signedTransaction);
        api.disconnect();
    } catch (e) {
        console.log(e);
    }

    const response = await fetch("http://localhost:" + process.env.PORT + "/api/transactions/pay", {
		method: "PUT",
		headers: {
            "Content-Type": "application/json",
            cookie: bearer
        },
		body: JSON.stringify({
            id: bobPaymentRequest.id,
            transactionHash: signedTransaction.id
		})
    });
    expect(response.status).toBe(200);

});

test('get a transaction request', async() => {
    const res = await fetch('http://localhost:' + process.env.PORT + '/api/transactions/'+ bobPaymentRequest.id, {
        method:'GET',
         headers: {
            cookie: bearer
        },
    });
    expect(res.status).toBe(200);
    const transaction: TransactionRequest = plainToClass(TransactionRequest, await res.json());
    expect(transaction.creditor.username).toBe("alice");
    expect(transaction.debtor.username).toBe("bob");
    expect(transaction.totalXrpDrops).toBe(5);
    expect(transaction.paid).toBe(true);

});


afterAll(async () => {
    child.kill();
});