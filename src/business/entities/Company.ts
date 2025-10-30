import { Types } from "mongoose";
import { CompanyProps, Address, CompanyDTO } from "../types/Company";

export class Company {
    private readonly id?: string;
    private readonly email?: string;
    private readonly createdAt: Date;

    private name: string;
    private description?: string;
    private logoUrl?: string;
    private address?: Address;
    private phoneNumber?: string;
    private managerId: string;
    private status: 'pending' | 'approved' | 'rejected';
    private employees?: string[];
    private subscriptionPlan?: string;
    private updatedAt: Date;

    public constructor(props: CompanyProps) {
        this.id = props.id instanceof Types.ObjectId ? props.id.toString() : props.id;
        this.email = props.email;
        this.createdAt = props.createdAt;
        this.name = props.name;
        this.description = props.description;
        this.logoUrl = props.logoUrl;
        this.address = props.address;
        this.phoneNumber = props.phoneNumber;
        this.managerId = props.managerId instanceof Types.ObjectId ? props.managerId.toString() : props.managerId;
        this.status = props.status;
        this.employees = (props.employees ?? []).map(emp => emp instanceof Types.ObjectId ? emp.toString() : emp);
        this.subscriptionPlan = (props.subscriptionPlan instanceof Types.ObjectId) ? props.subscriptionPlan.toString() : props.subscriptionPlan;
        this.updatedAt = props.updatedAt;
    }

    public static create(props: CompanyProps) : Company {
        return new Company(props);
    }

    public toJson(): CompanyDTO {
        return {
            id: this.id,
            email: this.email,
            name: this.name,
            description: this.description,
            logoUrl: this.logoUrl,
            address: this.address,
            phoneNumber: this.phoneNumber,
            managerId: this.managerId,
            status: this.status,
            employees: this.employees,
            subscriptionPlan: this.subscriptionPlan,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
        }
    }
}
