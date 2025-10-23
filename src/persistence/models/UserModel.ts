import { UserRole } from './../../business/enums/Role';
import { UserProps } from "../../business/types/User";
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema<UserProps>({
    email: { type: String, required: true, unique: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    password: { type: String, required: true },
    phoneNumber: String,
    role: { type: String, enum: Object.values(UserRole), default: UserRole.Client } as any,
    isVerified: { type: Boolean, default: false },
    profilePicture: String,
    status : { type: String, enum: ["active", "suspended", "deleted"], default: "active" },
}, { timestamps: true });

export const UserModel = mongoose.model('User', UserSchema);