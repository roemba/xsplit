import { Bill } from "../../src/models/Bill";
import { User } from "../../src/models/User";
import { BillWeight } from "../../src/models/BillWeight";
import { GroupService } from "../../src/services/GroupService";
import { Group } from "../../src/models/Group";
import { GroupBalance } from "../../src/models/GroupBalance";

const users: User[] = [], weights: BillWeight[] = [], balances: GroupBalance[] = [];
let group: Group, groupService: GroupService;

beforeEach(() => {
    group = new Group();
    group.groupBalances = [];
    for (let i = 0; i < 4; i++) {
        users[i] = new User();
        users[i].username = "user" + i;
        weights[i] = new BillWeight();
        weights[i].user = users[i];
        weights[i].weight = 1;
        balances[i] = new GroupBalance();
        balances[i].balance = 0;
        balances[i].group = group;
        balances[i].user = users[i];
        group.groupBalances.push(balances[i]);
    }
    group.participants = [users[0], users[1]];
    groupService = new GroupService(undefined);
});

test('100 drops, 2 people, equal weights', () => {
    const bill = new Bill();
    bill.group = group;
    bill.creditor = users[0];
    bill.participants = [users[0], users[1]];
    bill.totalXrpDrops = 100;
    bill.weights = [weights[0], weights[1]];
    const result = groupService.updateBalances(group, bill);
    expect(result.groupBalances.find(b => b.user.username === users[0].username).balance).toBe(50);
    expect(result.groupBalances.find(b => b.user.username === users[1].username).balance).toBe(-50);
    let total = 0;
    result.groupBalances.forEach(b => total += b.balance);
    expect(total).toBe(0);
});

test('100 drops, 2 people, 2:1 weights', () => {
    const bill = new Bill();
    bill.group = group;
    bill.creditor = users[0];
    bill.participants = [users[0], users[1]];
    bill.totalXrpDrops = 1000;
    weights[1].weight = 2;
    bill.weights = [weights[0], weights[1]];
    const result = groupService.updateBalances(group, bill);
    expect(result.groupBalances.find(b => b.user.username === users[0].username).balance).toBeLessThanOrEqual(667);
    expect(result.groupBalances.find(b => b.user.username === users[0].username).balance).toBeGreaterThanOrEqual(666);
    expect(result.groupBalances.find(b => b.user.username === users[1].username).balance).toBeLessThanOrEqual(-666);
    expect(result.groupBalances.find(b => b.user.username === users[1].username).balance).toBeGreaterThanOrEqual(-667);
    let total = 0;
    result.groupBalances.forEach(b => total += b.balance);
    expect(total).toBe(0);
});

test('100 drops, 3 people, equal weights', () => {
    const bill = new Bill();
    bill.group = group;
    bill.creditor = users[0];
    bill.participants = [users[0], users[1], users[2]];
    bill.totalXrpDrops = 1000;
    bill.weights = [weights[0], weights[1], weights[2]];
    const result = groupService.updateBalances(group, bill);
    expect(result.groupBalances.find(b => b.user.username === users[0].username).balance).toBeLessThanOrEqual(667);
    expect(result.groupBalances.find(b => b.user.username === users[0].username).balance).toBeGreaterThanOrEqual(666);
    expect(result.groupBalances.find(b => b.user.username === users[1].username).balance).toBeLessThanOrEqual(-333);
    expect(result.groupBalances.find(b => b.user.username === users[1].username).balance).toBeGreaterThanOrEqual(-334);
    expect(result.groupBalances.find(b => b.user.username === users[2].username).balance).toBeLessThanOrEqual(-333);
    expect(result.groupBalances.find(b => b.user.username === users[2].username).balance).toBeGreaterThanOrEqual(-334);
    let total = 0;
    result.groupBalances.forEach(b => total += b.balance);
    expect(total).toBe(0);
});

test('102 drops, 4 people, equal weights', () => {
    const bill = new Bill();
    bill.creditor = users[0];
    bill.participants = users;
    bill.totalXrpDrops = 102;
    bill.weights = weights;
    const result = groupService.updateBalances(group, bill);
    expect(result.groupBalances.find(b => b.user.username === users[0].username).balance).toBeLessThanOrEqual(77);
    expect(result.groupBalances.find(b => b.user.username === users[0].username).balance).toBeGreaterThanOrEqual(75);
    expect(result.groupBalances.find(b => b.user.username === users[1].username).balance).toBeLessThanOrEqual(-25);
    expect(result.groupBalances.find(b => b.user.username === users[1].username).balance).toBeGreaterThanOrEqual(-27);
    expect(result.groupBalances.find(b => b.user.username === users[2].username).balance).toBeLessThanOrEqual(-25);
    expect(result.groupBalances.find(b => b.user.username === users[2].username).balance).toBeGreaterThanOrEqual(-27);
    expect(result.groupBalances.find(b => b.user.username === users[3].username).balance).toBeLessThanOrEqual(-25);
    expect(result.groupBalances.find(b => b.user.username === users[3].username).balance).toBeGreaterThanOrEqual(-27);
    let total = 0;
    result.groupBalances.forEach(b => total += b.balance);
    expect(total).toBe(0);
});
