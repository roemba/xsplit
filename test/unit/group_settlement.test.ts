import { User } from "../../src/models/User";
import { GroupService } from "../../src/services/GroupService";
import { GroupBalance } from "../../src/models/GroupBalance";
import { TransactionRequest } from "../../src/models/TransactionRequest";

const users: User[] = [], balances: GroupBalance[] = [];
let groupService: GroupService;

beforeEach(() => {
    for (let i = 0; i < 4; i++) {
        users[i] = new User();
        users[i].username = "user" + i;
        balances[i] = new GroupBalance();
        balances[i].balance = 0;
        balances[i].user = users[i];
    }
    groupService = new GroupService(undefined);
});

test('2 balances', () => {
    balances[0].balance = 100;
    balances[1].balance = -100;
    const result: TransactionRequest[] = groupService.createSettlementTransactionRequests(balances);
    expect(result.length).toBe(1);
    expect(result[0].debtor.username).toBe(balances[1].user.username);
    expect(result[0].creditor.username).toBe(balances[0].user.username);
    expect(result[0].totalXrpDrops).toBe(100);
});

test('3 balances, 1 negative', () => {
    balances[0].balance = 50;
    balances[1].balance = 50;
    balances[2].balance = -100;
    const result: TransactionRequest[] = groupService.createSettlementTransactionRequests(balances);
    expect(result.length).toBe(2);
    for (const tr of result) {
        expect(tr.debtor.username).toBe(balances[2].user.username);
        expect(tr.creditor.username === balances[0].user.username 
            || tr.creditor.username === balances[1].user.username).toBeTruthy();
        expect(tr.totalXrpDrops).toBe(50);
    }
});

test('3 balances, 2 negative', () => {
    balances[0].balance = 100;
    balances[1].balance = -50;
    balances[2].balance = -50;
    const result: TransactionRequest[] = groupService.createSettlementTransactionRequests(balances);
    expect(result.length).toBe(2);
    for (const tr of result) {
        expect(tr.debtor.username === balances[1].user.username
            || tr.debtor.username === balances[2].user.username).toBeTruthy();
        expect(tr.creditor.username).toBe(balances[0].user.username);
        expect(tr.totalXrpDrops).toBe(50);
    }
});