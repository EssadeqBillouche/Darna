import express from 'express';

const router = express.Router();

import UserRepository from '../../persistence/repositories/UserRepository';
import { AuthService } from '../../business/services/AuthService';
import { AuthController } from '../controllers/AuthController';

const userRepository = new UserRepository();
const authService = new AuthService(userRepository);
const authController = new AuthController(authService);

router.post('/register', authController.register.bind(authController));

export default router
