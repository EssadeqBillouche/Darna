import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../../business/types/Express";

export class RoleMiddleware {
    private jwt_secret: string

    constructor() {
        if(!process.env.JWT_SECRET) throw Error('JWT_SECRET is not defined in environment variables');
        this.jwt_secret = process.env.JWT_SECRET
    }

    roleMiddleware (roles: string[]) {
        return (req: Request, res: Response, next: NextFunction) => {
            try {
                const authHeader = req.header('Authorization');
                
                if(!authHeader || !authHeader.startsWith('Bearer ')) {
                    return res.status(401).json({ message: 'No token provided or invalid format' });
                }

                const token = authHeader.slice(7);
                
                const currentUser = jwt.verify(token, this.jwt_secret) as JwtPayload;
                
                req.user = currentUser;
                
                if(currentUser && roles.includes(currentUser.role)) {
                    return next();
                }
                    
                res.status(402).json({ message: 'You can\'t access to this endpoint!' });
            } catch (error) {
                
            }

        }
    }
}