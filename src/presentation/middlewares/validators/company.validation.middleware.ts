import { body, ValidationChain } from "express-validator";

export class CompanyValidator {
    private _name: string = 'name';
    private _description: string = 'description';
    private _logoUrl: string = 'logoUrl';

    private _addressLine: string = 'address.addressLine'
    private _city: string = 'address.city'
    private _state: string = 'address.state'
    private _postalCode: string = 'address.postalCode'
    private _country: string = 'address.country'

    private _phoneNumber: string = 'phoneNumber';
    private _email: string = 'email';
    private _status: string = 'status';
    private _managerId: string = 'managerId';
    private _subscriptionPlan: string = 'subscriptionPlan';


    public createCompanyValidation(): ValidationChain[] {
        return [
            body(this._name).notEmpty().withMessage('Company name is required'),
            body(this._description).optional().isLength({ min: 10, max: 500 }),
            body(this._logoUrl).optional(),
            body(this._addressLine).notEmpty().withMessage('address line is required'),
            body(this._city).notEmpty().withMessage('city is required'),
            body(this._state).notEmpty().withMessage('state is required'),
            body(this._postalCode).notEmpty().withMessage('postal code is required'),
            body(this._country).notEmpty().withMessage('country is required'),
            body(this._phoneNumber).notEmpty().withMessage('Number Phone is required'),
            body(this._email).notEmpty().isEmail().withMessage('Email is Invalid'),
            body(this._status).optional().isIn(['pending', 'approved', 'rejected']).withMessage(`Invalid status`),
            body(this._managerId).notEmpty().withMessage('Manger is required'),
            body(this._subscriptionPlan).notEmpty().withMessage('subcription plan is required'),
        ]
    }
}