import { validationResult } from 'express-validator';
import { NextFunction, Request, Response } from "express";


export class HandleError {

    public static validate(req: Request, res: Response, next: NextFunction) {
        const errors = validationResult(req);
        console.log(errors);
        
        if (!errors.isEmpty()) {
            const formattedErrors: Record<string, string> = {};
            errors.array().forEach(err => {
                const key = (err as any).path;
                formattedErrors[key] = String(err.msg);
            });
            return res.status(400).json({ status: 'error', errors: formattedErrors });
        }
        next();
    };
}