import { UserProps, UserDTO } from '../types/User';
import { UserRole } from '../enums/Role';
import bcrypt from 'bcryptjs';


export class User {
    public readonly id?: string;
    public readonly email: string;
    public readonly createdAt: Date;

    private _firstName: string;
    private _lastName: string;
    private _phoneNumber: string;
    private _profilePicture?: string;
    private _role: UserRole;
    private _isVerified: boolean;
    private _status: 'active' | 'suspended' | 'deleted';
    private _updatedAt: Date;
    private _passwordHash: string;

    public constructor(props: UserProps) {
        this.id = props.id;
        this.email = props.email;
        this._firstName = props.firstName;
        this._lastName = props.lastName;
        this._phoneNumber = props.phoneNumber;
        this._profilePicture = props.profilePicture;
        this._role = props.role;
        this._isVerified = props.isVerified;
        this._status = props.status;
        this._passwordHash = props.password;
        this.createdAt = props.createdAt ?? new Date();
        this._updatedAt = props.updatedAt ?? new Date();
    }

    public static async create(props: Omit<UserProps, 'password'> & { password: string }): Promise<User> {
        const hash = await bcrypt.hash(props.password, 10);
        return new User({ ...props, password: hash });
    }

    public get firstName(): string { return this._firstName; }
    public get lastName(): string { return this._lastName; }
    public get fullName(): string { return `${this._firstName} ${this._lastName}`; }
    public get phoneNumber(): string { return this._phoneNumber; }
    public get profilePicture(): string | undefined { return this._profilePicture; }
    public get role(): UserRole { return this._role; }
    public get isVerified(): boolean { return this._isVerified; }
    public get status(): 'active' | 'suspended' | 'deleted' { return this._status; }
    public get updatedAt(): Date { return this._updatedAt; }

    public updateProfile(data: {
        firstName?: string;
        lastName?: string;
        phoneNumber?: string;
        profilePicture?: string;
    }): void {
        if (data.firstName) this._firstName = data.firstName.trim();
        if (data.lastName) this._lastName = data.lastName.trim();
        if (data.phoneNumber) this._phoneNumber = data.phoneNumber;
        if (data.profilePicture !== undefined) this._profilePicture = data.profilePicture;
        this.touch();
    }

    public verifyEmail(): void {
        if (this._isVerified) return;
        this._isVerified = true;
        this.touch();
    }

    public suspend(): void {
        if (this._status === 'deleted') throw new Error('Cannot suspend deleted user');
        this._status = 'suspended';
        this.touch();
    }

    public activate(): void {
        if (this._status === 'deleted') throw new Error('Cannot activate deleted user');
        this._status = 'active';
        this.touch();
    }

    public async changePassword(oldPlain: string, newPlain: string): Promise<void> {
        const isOldValid = await bcrypt.compare(oldPlain, this._passwordHash);
        if (!isOldValid) throw new Error('Current password is incorrect');
        this._passwordHash = await bcrypt.hash(newPlain, 10);
        this.touch();
    }

    public async comparePassword(plain: string): Promise<boolean> {
        return bcrypt.compare(plain, this._passwordHash);
    }

    private touch(): void {
        this._updatedAt = new Date();
    }

    public toPersistence(): any {
        return {
            email: this.email,
            passwordHash: this._passwordHash,
            firstName: this._firstName,
            lastName: this._lastName,
            phoneNumber: this._phoneNumber,
            profilePicture: this._profilePicture,
            role: this._role,
            isVerified: this._isVerified,
            status: this._status,
            createdAt: this.createdAt,
            updatedAt: this._updatedAt,
        };
    }

    public toJSON(): UserDTO {
        return {
            id: this.id,
            email: this.email,
            firstName: this._firstName,
            lastName: this._lastName,
            role: this._role,
            phoneNumber: this._phoneNumber,
            isVerified: this._isVerified,
            profilePicture: this._profilePicture,
            status: this._status,
            createdAt: this.createdAt,
            updatedAt: this._updatedAt,
        };
    }
}