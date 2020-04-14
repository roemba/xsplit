import dotenv from "dotenv";
import { User } from "../../src/models/User";
import { PrivateInformation } from "../../src/models/PrivateInformation";
import { UserService } from "../../src/services/UserService";
import { NotificationService } from "../../src/services/NotificationService";

let user: User;
let pi: PrivateInformation;
let userService: UserService;
let notificationService: NotificationService;

beforeAll(async () => {
    dotenv.config();
    userService = new UserService(undefined, undefined);
    notificationService = new NotificationService();
    user = new User();
    pi = new PrivateInformation();
    user.username = 'user_test';
    pi.email = 'xplit20@yahoo.com';
    user.private = pi;
    userService.create(user).catch(() => {
        expect(false);
    });
});

test('send payment received notification', async () => {
    notificationService.sendPaymentReceivedNotification(user).then(() => {
        expect(true).toBeTruthy();
    }).catch(() => {
        expect(false);
    });
});

test('send payment request notification', async () => {
    notificationService.sendPaymentRequestNotification([user]).then(() => {
        expect(true).toBeTruthy();
    }).catch(() => {
        expect(false);
    });
});