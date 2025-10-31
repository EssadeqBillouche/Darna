import { Types } from 'mongoose';

export interface Address {
    addressLine?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
}

export interface CompanyProps {
    id?: Types.ObjectId;
    name: string;
    description?: string;
    logoUrl?: string;
    address?: Address;
    phoneNumber?: string;
    email?: string;
    status: 'pending' | 'approved' | 'rejected';
    managerId: Types.ObjectId;
    employees: Types.ObjectId[];
    subscriptionPlan?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

export interface CompanyDTO {
    id?: string;
    name: string;
    description?: string;
    logoUrl?: string;
    address?: Address;
    phoneNumber?: string;
    email?: string;
    status: 'pending' | 'approved' | 'rejected';
    managerId: string;
    employees?: string[];
    subscriptionPlan?: string;
    createdAt: Date;
    updatedAt: Date;
}
