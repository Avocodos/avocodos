declare module 'zeptomail' {
    export class SendMailClient {
        constructor(options: { url: string; token: string });
        sendMail(options: any): Promise<any>;
    }
}