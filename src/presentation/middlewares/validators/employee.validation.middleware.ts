import { body, ValidationChain } from "express-validator";
import { UserRole } from "../../../business/enums/Role";

export class EmployeeValidator {
    private _firstName: string = 'firstName';
    private _lastName: string = 'lastName';
    private _phoneNumber: string = 'phoneNumber';

    public addEmployeeValidation(): ValidationChain[] {
        return [
            body(this._firstName).notEmpty().withMessage('First name is required'),
            body(this._lastName).notEmpty().withMessage('Last name is required'),
            body(this._phoneNumber).notEmpty().withMessage('Phone is required'),
        ]
    }
}