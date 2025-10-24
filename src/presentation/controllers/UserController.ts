import { Request, Response } from "express";
import { UserService } from "../../business/services/UserService";
export class UserController{
    private UserService : UserService;
    constructor (UserService : UserService)
    {
        this.UserService = UserService
    }

    public async register(req: Request, res: Response) {
        try {
            const result = await this.UserService.register(req.body);
            
            res.status(201).json({ user: result });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}