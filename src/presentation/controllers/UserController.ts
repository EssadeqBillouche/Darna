import { Request, Response } from "express";
import { UserService } from "../../business/services/UserService";

export class UserController {
    private userService: UserService;

    constructor(userService: UserService) {
        this.userService = userService;
    }

    public async register(req: Request, res: Response) {
        try {
            const result = await this.userService.register(req.body);
            res.status(201).json({ user: result });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    public async verifyEmail(req: Request, res: Response) {
        const token = typeof req.query.token === 'string' ? req.query.token : undefined;

        if (!token) {
            return res.status(400).json({ error: 'Verification token is required' });
        }

        try {
            const user = await this.userService.verifyEmail(token);
            return res.status(200).json({ user, message: 'Email verified successfully' });
        } catch (error: any) {
            return res.status(400).json({ error: error.message });
        }
    }
    public async login(req: Request, res: Response): Promise<Response> {
        try {
            
            const token = await this.userService.login(req.body);

            return res.status(200).json({ token });
        } catch (error: any) {
            return res.status(401).json({ message: error.message || 'Login failed' });
        }
    }
}