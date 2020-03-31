import { Bill } from "../../src/models/Bill";
import { User } from "../../src/models/User";
import { BillWeight } from "../../src/models/BillWeight";
import { BillService } from "../../src/services/BillService";

let user1: User, user2: User, weight1: BillWeight, weight2: BillWeight, billService: BillService;

beforeEach(() => {
    user1 = new User();
    user1.username = "user1";
    user2 = new User();
    user2.username = "user2";
    weight1 = new BillWeight();
    weight1.user = user1;
    weight1.weight = 1;
    weight2 = new BillWeight();
    weight2.user = user2;
    weight2.weight = 1;
    billService = new BillService(undefined, undefined);
});

test('Transaction with equal weights requests are created correctly', () => {
    const bill = new Bill();
    bill.creditor = user1;
    bill.participants = [user1, user2];
    bill.totalXrpDrops = 100;
    bill.weights = [weight1, weight2];
    const res = billService.createTransactionRequests(bill);
    expect(res.length).toBe(2);
    expect(res[0].totalXrpDrops).toBe(50);
    expect(res[0].paid).toBe(true);
    expect(res[1].totalXrpDrops).toBe(50);
    expect(res[1].paid).toBe(false);
});