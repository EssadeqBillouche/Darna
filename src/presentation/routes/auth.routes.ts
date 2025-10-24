import express from 'express';

const router = express.Router();

import UserRepository from '../../persistence/repositories/UserRepository';
import { UserService } from '../../business/services/UserService';
import { UserController } from '../controllers/UserController';
import { EmailService } from '../../infrastructure/notifications/email.service';

const userRepository = new UserRepository();
const emailService = new EmailService();
const authService = new UserService(userRepository, emailService);
const authController = new UserController(authService);

router.post('/register', authController.register.bind(authController));
router.get('/verify-email', authController.verifyEmail.bind(authController));

export default router
