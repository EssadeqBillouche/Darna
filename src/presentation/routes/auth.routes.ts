import express from 'express';
import multer from "multer";

const router = express.Router();
const upload = multer();

import UserRepository from '../../persistence/repositories/UserRepository';
import { UserService } from '../../business/services/UserService';
import { UserController } from '../controllers/UserController';
import { UserValidator } from '../middlewares/validators/user.validation.middleware';
import { HandleError } from '../middlewares/error.middleware';

const userRepository = new UserRepository();
const authService = new UserService(userRepository);
const authController = new UserController(authService);
const userValidator = new UserValidator();

router.post('/register', upload.none(), userValidator.registerValidation(), HandleError.validate, authController.register.bind(authController));

export default router
