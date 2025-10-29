import mongoose, { Schema } from "mongoose";
import { CompanyProps } from "../../business/types/Company";

const CompanySchema = new Schema<CompanyProps>({
    name: { type: String, required: true, unique: true },
    description: { type: String },
    logoUrl: { type: String },
    address: { type: String, trim: true },
    phoneNumber: { type: String, trim: true },
    email: { type: String, lowercase: true, unique: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    managerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    employees: [ { type: Schema.Types.ObjectId, ref: 'User', } ],
    subscriptionPlan: { type: Schema.Types.ObjectId, ref: 'Subscription' },
}, { timestamps: true });

export const CompanyModel = mongoose.model<CompanyProps>('Company', CompanySchema);