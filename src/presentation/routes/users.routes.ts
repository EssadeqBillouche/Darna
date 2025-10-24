import express from 'express';
import { Request, Response } from 'express';
import { RoleMiddleware } from '../middlewares/role.middleware';

const roleMiddleware = new RoleMiddleware();
const router = express.Router();

router.get('/profile', roleMiddleware.roleMiddleware(['Admin']) ,(req: Request, res: Response) => {
    res.json({ user: req.user })
});

export default router
