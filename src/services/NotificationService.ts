import { Container, Service } from 'typedi';
import {setApiKey, send} from '@sendgrid/mail';
import {ClientResponse} from "@sendgrid/client/src/response";
import { UserService } from '../services/UserService';
import { User } from '../models/User';
import { LoggerService } from '../services/LoggerService';

@Service()
export class NotificationService {

    log = Container.get(LoggerService);

    constructor() {
        setApiKey(process.env.SENDGRID_API_KEY);
    }

    public async sendPaymentReceivedNotification(user: User): Promise<void> {
        this.log.info("Creating payment received notification");
        user = await Container.get(UserService).findOne(user.username, {relations: ["private"]});
        if (user.private.notifications) {
            const addresses = [user.private.email];
            const subject = "XPLIT: payment received";
            const message = `Hello, &#x1F44B; <br><br>
                You have received a new payment! &#x26A1;&#x1F447;  <br>
                Please check your current bills in your account: <a href='http://xsplit.ewi.tudelft.nl/home' target='_blank'>xsplit.ewi.tudelft.nl</a>`
            ;
            this.log.info("Sending new payment received notification to: " + addresses.toString());
            const notify = this.sendNotificationEmail(addresses, subject, message, message);
            notify.then(() => {
                this.log.info("Email(s) sent successfully!");
            }).catch((e) => {
                this.log.error("Error occurred while sending email(s)!");
                this.log.error(e);
            });
        } else {
            this.log.info("User has notifications disabled. Not sending notifications!");
        }
    }

    public async sendPaymentRequestNotification(users: User[]): Promise<void> {
        this.log.info("Creating payment request notification");
        const addresses = [];
        const subject = "XPLIT: payment request";
        const message = `Hello, &#x1F44B; <br><br>
            You have a new payment request! &#x26A1;&#x1F447;  <br>
            Please check the current bill status in your account: <a href='http://xsplit.ewi.tudelft.nl/home' target='_blank'>xsplit.ewi.tudelft.nl</a>`
        ;
        for (const name of users) {
            const user = await Container.get(UserService).findOne(name.username, {relations: ["private"]});
            if (user.private.notifications) {
                addresses.push(user.private.email);
            }
        }
        if (addresses.length > 0) {
            this.log.info("Sending new payment request notification to: " + addresses.toString());
            const notify = this.sendNotificationEmail(addresses, subject, message, message);
            notify.then(() => {
                this.log.info("Email(s) sent successfully!");
            }).catch((e) => {
                this.log.error("Error occurred while sending email(s)!");
                this.log.error(e);
            });
        } else {
            this.log.info("Email list is empty. Not sending notifications!");
        }
    }

    public async sendNotificationEmail(addresses: string[], subject: string, message: string, html: string): Promise<[ClientResponse, {}]> {
        this.log.info("Sending email notification to users");
        const email = {
            to: addresses,
            from: 'notification@xplit.com',
            subject: subject,
            text: message,
            html: html,
            isMultiple: true
        };
        return send(email);
    }
}