import { Types } from 'mongoose';

export interface Adress {
    addressLine?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
}

export interface CompanyProps {
    id?: string;
    name: string;
    description?: string;
    logoUrl?: string;
    address?: Adress;
    phoneNumber?: string;
    email?: string;
    status: 'pending' | 'approved' | 'rejected';
    managerId: Types.ObjectId;
    employees: Types.ObjectId[];
    subscriptionPlan?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
