import express from 'express';

const router = express.Router();

import UserRepository from '../../persistence/repositories/UserRepository';
import { UserService } from '../../business/services/UserService';
import { UserController } from '../controllers/UserController';

const userRepository = new UserRepository();
const authService = new UserService(userRepository);
const authController = new UserController(authService);

router.post('/register', authController.register.bind(authController));

export default router
