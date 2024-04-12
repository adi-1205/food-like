import { SendMailOptions } from "nodemailer";


export interface SendHtmlMailOptions extends Omit<SendMailOptions, 'html'> {
    context?: {
        url: string
    }
}