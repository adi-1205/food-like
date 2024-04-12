import { Injectable } from '@nestjs/common';
import * as mailer from 'nodemailer'
import { SendHtmlMailOptions } from './interfaces/html-mail.interface';
import * as hbs from 'handlebars';
import * as dotenv from 'dotenv';
dotenv.config()

@Injectable()
export class MailService {

    private htmlTemplate

    constructor() {
        this.htmlTemplate = `
        <h1>Click below link to verify your accout</h1>
        <a href="{{url}}">Verify my email</a>
        `
        console.log(process.env.MAIL_USER,);

    }

    createTransport(): mailer.Transporter {
        return mailer.createTransport({
            service: "Gmail",
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_KEY
            }
        });
    }

    async sendMail(options: mailer.SendMailOptions): Promise<any> {
        const transporter = this.createTransport();
        try {
            const result = await transporter.sendMail(options);
            return { result, sent: true };
        } catch (error) {
            console.log(error);
            return { error, sent: false }
        }
    }


    async sendHtmlMail(options: SendHtmlMailOptions): Promise<any> {
        const transporter = this.createTransport();
        let compiled = hbs.compile(this.htmlTemplate)
        let htmlOutput = compiled(options.context)
        try {
            const result = await transporter.sendMail({
                ...options,
                html: htmlOutput
            });
            return { result, sent: true };
        } catch (error) {
            return { error, sent: false }
        }
    }



    async sendInviteMail(email, token) {
        const transporter = this.createTransport();
        try {
            const result = await transporter.sendMail({
                from: process.env.GMAIL_USER,
                to: email,
                subject: 'Verify Account',
                html: `
                <h3>Click below link to verify your account</h3>
                <a href='${process.env.SERVER_URL}/auth/verify/${token}'>Verify</a>
                `
            });
            return { result, sent: true };
        } catch (error) {
            console.log(error);
            return { error, sent: false }
        }
    }
}