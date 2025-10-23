import { Request, Response } from "express";
import { AuthService } from "../../business/services/AuthService";
export class AuthController{
    private AuthService : AuthService;
    constructor (AuthService : AuthService)
    {
        this.AuthService = AuthService
    }

    public async register(req: Request, res: Response) {
        try {
            const result = await this.AuthService.register(req.body);
            
            res.status(201).json({ user: result });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}