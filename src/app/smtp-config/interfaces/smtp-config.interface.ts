export interface SmtpConfig{
    id?: number;
    loginId?: number;
    username?: string;
    email?: string;
    password?: string;
    host?: string;
    port?: number;
    active?: boolean;
}

export interface SmtpConfigInput{
    loginId?: number;
    username?: string;
    email?: string;
    password?: string;
    host?: string;
    port?: number;
    active?: boolean;
}

export class UpdateSmtpConfig{
    username?: string;
    email?: string;
    password?: string;
    host?: string;
    port?: number;
    active?: Boolean;
}

