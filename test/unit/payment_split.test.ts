import { Bill } from "../../src/models/Bill";
import { User } from "../../src/models/User";
import { BillWeight } from "../../src/models/BillWeight";
import { BillService } from "../../src/services/BillService";

let user1: User, user2: User, user3: User, user4: User,
weight1: BillWeight, weight2: BillWeight, weight3: BillWeight, weight4: BillWeight,
billService: BillService;

beforeEach(() => {
    user1 = new User();
    user1.username = "user1";
    user2 = new User();
    user2.username = "user2";
    user3 = new User();
    user3.username = "user3";
    user4 = new User();
    user4.username = "user4";
    weight1 = new BillWeight();
    weight1.user = user1;
    weight1.weight = 1;
    weight2 = new BillWeight();
    weight2.user = user2;
    weight2.weight = 1;
    weight3 = new BillWeight();
    weight3.user = user3;
    weight3.weight = 1;
    weight4 = new BillWeight();
    weight4.user = user4;
    weight4.weight = 1;
    billService = new BillService(undefined, undefined);
});

test('100 drops, 2 people, equal weights', () => {
    const bill = new Bill();
    bill.creditor = user1;
    bill.participants = [user1, user2];
    bill.totalXrpDrops = 100;
    bill.weights = [weight1, weight2];
    const res = billService.createTransactionRequests(bill);
    expect(res.length).toBe(2);
    expect(res[0].totalXrpDrops).toBe(res[1].totalXrpDrops);
    expect(res[0].paid).toBe(true);
    expect(res[1].paid).toBe(false);
    expect(res[0].totalXrpDrops + res[1].totalXrpDrops).toBe(bill.totalXrpDrops);
});

test('1000 drops, 2 people, 2:1 weights', () => {
    const bill = new Bill();
    bill.creditor = user1;
    bill.participants = [user1, user2];
    bill.totalXrpDrops = 1000;
    weight2.weight = 2;
    bill.weights = [weight1, weight2];
    const res = billService.createTransactionRequests(bill);
    expect(res.length).toBe(2);
    expect(res[0].totalXrpDrops).toBeGreaterThanOrEqual(333);
    expect(res[0].paid).toBe(true);
    expect(res[1].totalXrpDrops).toBeGreaterThanOrEqual(666);
    expect(res[1].paid).toBe(false);
    expect(res[0].totalXrpDrops + res[1].totalXrpDrops).toBe(bill.totalXrpDrops);
});

test('998 drops, 2 people, 2:1 weights', () => {
    const bill = new Bill();
    bill.creditor = user1;
    bill.participants = [user1, user2];
    bill.totalXrpDrops = 998;
    weight2.weight = 2;
    bill.weights = [weight1, weight2];
    const res = billService.createTransactionRequests(bill);
    expect(res.length).toBe(2);
    expect(res[0].totalXrpDrops).toBeGreaterThanOrEqual(332);
    expect(res[0].paid).toBe(true);
    expect(res[1].totalXrpDrops).toBeGreaterThanOrEqual(665);
    expect(res[1].paid).toBe(false);
    expect(res[0].totalXrpDrops + res[1].totalXrpDrops).toBe(bill.totalXrpDrops);
});

test('100 drops, 3 people, equal weights', () => {
    const bill = new Bill();
    bill.creditor = user1;
    bill.participants = [user1, user2, user3];
    bill.totalXrpDrops = 100;
    bill.weights = [weight1, weight2, weight3];
    const res = billService.createTransactionRequests(bill);
    expect(res.length).toBe(3);
    expect(res[0].totalXrpDrops).toBeGreaterThanOrEqual(33);
    expect(res[0].paid).toBe(true);
    expect(res[1].totalXrpDrops).toBeGreaterThanOrEqual(33);
    expect(res[1].paid).toBe(false);
    expect(res[2].totalXrpDrops).toBeGreaterThanOrEqual(33);
    expect(res[2].paid).toBe(false);
    expect(res[0].totalXrpDrops + res[1].totalXrpDrops + res[2].totalXrpDrops).toBe(bill.totalXrpDrops);
});

test('102 drops, 4 people, equal weights', () => {
    const bill = new Bill();
    bill.creditor = user1;
    bill.participants = [user1, user2, user3, user4];
    bill.totalXrpDrops = 102;
    bill.weights = [weight1, weight2, weight3, weight4];
    const res = billService.createTransactionRequests(bill);
    expect(res.length).toBe(4);
    expect(res[0].totalXrpDrops).toBeGreaterThanOrEqual(25);
    expect(res[0].paid).toBe(true);
    expect(res[1].totalXrpDrops).toBeGreaterThanOrEqual(25);
    expect(res[1].paid).toBe(false);
    expect(res[2].totalXrpDrops).toBeGreaterThanOrEqual(25);
    expect(res[2].paid).toBe(false);
    expect(res[3].totalXrpDrops).toBeGreaterThanOrEqual(25);
    expect(res[3].paid).toBe(false);
    expect(res[0].totalXrpDrops + res[1].totalXrpDrops + res[2].totalXrpDrops + res[3].totalXrpDrops).toBe(bill.totalXrpDrops);
});