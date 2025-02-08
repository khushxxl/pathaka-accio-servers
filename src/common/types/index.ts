import { JWTPayload } from 'express-oauth2-jwt-bearer';

export interface IErrorHandler {
    statusCode: number;
    message: string;
    name: string;
}

export interface TokenPayload extends JWTPayload {
    custom_email_claim: string;
    sub: string;
}
