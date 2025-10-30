import express from 'express';
import multer from "multer";
import { RoleMiddleware } from '../middlewares/role.middleware';

const roleMiddleware = new RoleMiddleware();
const upload = multer();
const router = express.Router();

import { CompanyRepository } from '../../persistence/repositories/CompanyRepository';
import { CompanyService } from '../../business/services/CompanyService';
import { CompanyController } from '../controllers/CompanyController';
import { CompanyValidator } from '../middlewares/validators/company.validation.middleware';
import { HandleError } from '../middlewares/error.middleware';

const companyRepo = new CompanyRepository(); 
const companyService = new CompanyService(companyRepo); 
const companyController = new CompanyController(companyService);
const companyValidator = new CompanyValidator();

// Company Routes
router.post('/create', upload.none(), companyValidator.createCompanyValidation(), HandleError.validate, roleMiddleware.roleMiddleware(['Manager']), companyController.create.bind(companyController));
router.get('/:id', HandleError.validate, roleMiddleware.roleMiddleware(['Manager', 'Admin', 'Client']), companyController.getById.bind(companyController));

export default router
