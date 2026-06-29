export interface MailOptions {
    to: string;
}

export interface MailAttachment {
    path: string;
    filename?: string;
    cid?: string;
}