import express from 'express';
import multer from "multer";
import { Request, Response } from 'express';
import { RoleMiddleware } from '../middlewares/role.middleware';

const roleMiddleware = new RoleMiddleware();
const upload = multer();
const router = express.Router();

import UserRepository from '../../persistence/repositories/UserRepository';
import { UserService } from '../../business/services/UserService';
import { UserController } from '../controllers/UserController';
import { EmailService } from '../../infrastructure/notifications/email.service';
import { UserValidator } from '../middlewares/validators/user.validation.middleware';
import { HandleError } from '../middlewares/error.middleware';

const userRepository = new UserRepository();
const emailService = new EmailService();
const userService = new UserService(userRepository, emailService);
const userController = new UserController(userService);
const userValidator = new UserValidator();

// AUth Routes
router.get('/verify-email', userController.verifyEmail.bind(userController));
router.post('/register', upload.none(), userValidator.registerValidation(), HandleError.validate, userController.register.bind(userController));

// User routes
router.get('/profile', roleMiddleware.roleMiddleware(['Admin']) ,(req: Request, res: Response) => {
    res.json({ user: req.user })
});
router.patch('/:userId/update-status',upload.none(), roleMiddleware.roleMiddleware(['Admin']), userValidator.userStatusValidation(), HandleError.validate, userController.changeUserStatus.bind(userController));
router.post('/login', upload.none(), userController.login.bind(userController));

export default router
