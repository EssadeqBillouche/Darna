import { Types } from "mongoose";
import { CompanyProps, Address, CompanyDTO } from "../types/Company";

export class Company {
    private readonly _id?: string;
    private readonly _email?: string;
    private readonly _createdAt: Date;

    private _name: string;
    private _description?: string;
    private _logoUrl?: string;
    private _address?: Address;
    private _phoneNumber?: string;
    private _managerId: string;
    private _status: 'pending' | 'approved' | 'rejected';
    private _employees?: string[];
    private _subscriptionPlan?: string;
    private _updatedAt: Date;

    public constructor(props: CompanyProps) {
        this._id = props.id instanceof Types.ObjectId ? props.id.toString() : props.id;
        this._email = props.email;
        this._createdAt = props.createdAt;
        this._name = props.name;
        this._description = props.description;
        this._logoUrl = props.logoUrl;
        this._address = props.address;
        this._phoneNumber = props.phoneNumber;
        this._managerId = props.managerId instanceof Types.ObjectId ? props.managerId.toString() : props.managerId;
        this._status = props.status;
        this._employees = (props.employees ?? []).map(emp => emp instanceof Types.ObjectId ? emp.toString() : emp);
        this._subscriptionPlan = (props.subscriptionPlan instanceof Types.ObjectId) ? props.subscriptionPlan.toString() : props.subscriptionPlan;
        this._updatedAt = props.updatedAt;
    }

    public static create(props: CompanyProps) : Company {
        return new Company(props);
    }

    public get name(): string { return this._name } 

    public toJson(): CompanyDTO {
        return {
            id: this._id,
            email: this._email,
            name: this._name,
            description: this._description,
            logoUrl: this._logoUrl,
            address: this._address,
            phoneNumber: this._phoneNumber,
            managerId: this._managerId,
            status: this._status,
            employees: this._employees,
            subscriptionPlan: this._subscriptionPlan,
            createdAt: this._createdAt,
            updatedAt: this._updatedAt,
        }
    }
}
