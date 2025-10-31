import express from "express";
import multer from "multer";
import { EmployeeController } from "../controllers/EmployeeController";
import { EmployeeService } from "../../business/services/EmployeeService";
import { EmployeeRepository } from "../../persistence/repositories/EmpolyeeRepository";
import { CompanyRepository } from "../../persistence/repositories/CompanyRepository";
import { RoleMiddleware } from "../middlewares/role.middleware";
import { EmployeeValidator } from "../middlewares/validators/employee.validation.middleware";
import { HandleError } from "../middlewares/error.middleware";
import { EmailService } from "../../infrastructure/notifications/email.service";

const router = express.Router();
const upload = multer();

const employeeRepo = new EmployeeRepository();
const companyRepo = new CompanyRepository();
const emailService = new EmailService();
const employeeService = new EmployeeService(employeeRepo, companyRepo, emailService);
const employeeController = new EmployeeController(employeeService);
const roleMiddleware = new RoleMiddleware();
const employeeValidator = new EmployeeValidator();

router.post("/:companyId/create-employee", upload.none(), roleMiddleware.roleMiddleware(['Manager']), employeeValidator.addEmployeeValidation(), HandleError.validate, employeeController.createEmployee.bind(employeeController));

export default router;
