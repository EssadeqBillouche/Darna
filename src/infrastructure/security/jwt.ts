import jwt from 'jsonwebtoken'
import { UserDTO } from '../../business/types/User'
import dotenv from 'dotenv'

dotenv.config();

export interface JwtPayload {
    id?: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status : string;
    isVerified: boolean;
}

export default class JwtService {
    private readonly secretKey: string;
    private readonly expiresIn: string;

    constructor() {
        const secret = process.env.JWT_SECRET;
        const expires = process.env.JWT_EXPIRES_IN;
        
        if (!secret) {
            throw new Error('JWT_SECRET environment variable is required');
        }
        
        this.secretKey = secret;
        this.expiresIn = expires || '2d';
    }

    async generateToken(userData: UserDTO): Promise<string> {
        const payload: JwtPayload = {
            id: userData.id,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role,
            status: userData.status,
            isVerified: userData.isVerified
        };
        
        return await jwt.sign(payload, this.secretKey, { expiresIn: '7d' });
    }

    async verifyToken(token: string): Promise<JwtPayload> {
        try {
            return jwt.verify(token, this.secretKey) as JwtPayload;
        } catch (error) {
            if (error instanceof jwt.JsonWebTokenError) {
                throw new Error('Invalid token');
            } else if (error instanceof jwt.TokenExpiredError) {
                throw new Error('Token expired');
            }
            throw new Error('Token verification failed');
        }
    }

    async generateRefreshToken(userData: UserDTO): Promise<string> {
        const payload: JwtPayload = {
            id: userData.id,
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            role: userData.role,
            status: userData.status,
            isVerified: userData.isVerified
        };
        
        const options: jwt.SignOptions = {
            expiresIn: '30d'
        };
        
        return jwt.sign(payload, this.secretKey, options);
    }


}

