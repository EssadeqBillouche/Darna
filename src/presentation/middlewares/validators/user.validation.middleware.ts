import { body, ValidationChain } from "express-validator";
import { UserRole } from "../../../business/enums/Role";

export class UserValidator {
    private _firstName: string = 'firstName';
    private _lastName: string = 'lastName';
    private _email: string = 'email';
    private _password: string = 'password';
    private _phoneNumber: string = 'phoneNumber';
    private _role: string = 'role';
    private _status: string = 'status';


    public registerValidation(): ValidationChain[] {
        return [
            body(this._firstName).notEmpty().withMessage('First name is required'),
            body(this._lastName).notEmpty().withMessage('Last name is required'),
            body(this._email)
                .notEmpty().withMessage('Email is required')
                .isEmail().withMessage('Invalid email'),
            body(this._password)
                .notEmpty().withMessage('Password is required')
                .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
            body(this._phoneNumber).notEmpty().withMessage('Phone is required'),
            body(this._role).optional().isIn(Object.values(UserRole)).withMessage(`Role must be one of ${Object.values(UserRole).join(', ')}`),
            body(this._status).optional().isIn(['active', 'suspended', 'deleted']).withMessage(`Invalid status`),
        ]
    }

    public userStatusValidation(): ValidationChain[] {
        return [
            body(this._status).isIn(['active', 'suspended', 'deleted']).withMessage(`Invalid status`),
        ]
    }
}