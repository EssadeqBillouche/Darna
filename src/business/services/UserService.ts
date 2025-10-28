import { randomBytes } from 'crypto';
import { User } from '../../business/entities/User';
import { UserRole } from '../../business/enums/Role';
import UserRepository from '../../persistence/repositories/UserRepository';
import JwtService from '../../infrastructure/security/jwt'
import { EmailService } from '../../infrastructure/notifications/email.service';
import { UserDTO } from '../types/User';

export class UserService {
    private verificationTokenTTL = 1000 * 60 * 60 * 24; // 24 hours in ms

    constructor(
        private userRepository: UserRepository,
        private emailService: EmailService,
    ) {}

    public async register(data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phoneNumber?: string;
        role: UserRole;
    }): Promise<UserDTO> {
        const existing = await this.userRepository.findByEmail(data.email);
        if (existing) throw new Error('Email already exists');

        const userEntity = await User.create({
            email: data.email,
            password: data.password,
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: data.phoneNumber ?? '',
            role: data.role,
            isVerified: false,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const verificationToken = this.generateVerificationToken();
        const verificationExpiresAt = this.getVerificationExpiry();
        userEntity.setVerificationToken(verificationToken, verificationExpiresAt);

        const savedUser = await this.userRepository.create(userEntity);

        await this.emailService.sendVerificationEmail({
            to: savedUser.email,
            firstName: savedUser.firstName,
            token: verificationToken,
            expiresAt: verificationExpiresAt,
        });

        return savedUser.toJSON();
    }

    public async verifyEmail(token: string): Promise<UserDTO> {
        if (!token) throw new Error('Verification token is required');

        const user = await this.userRepository.findByVerificationToken(token);
        if (!user) throw new Error('Invalid verification token');

        const expiresAt = user.verificationTokenExpiresAt;
        if (!expiresAt || expiresAt.getTime() < Date.now()) {
            user.clearVerificationToken();
            await this.userRepository.update(user);
            throw new Error('Verification token has expired');
        }

        user.verifyEmail();
        const updatedUser = await this.userRepository.update(user);
        return updatedUser.toJSON();
    }

    private generateVerificationToken(): string {
        return randomBytes(32).toString('hex');
    }

    private getVerificationExpiry(): Date {
        return new Date(Date.now() + this.verificationTokenTTL);
    }

    public async changeUserStatus(userId : string, status: string) : Promise<UserDTO> {
        if(!userId) throw new Error('Cannot update user status without an identifier')
        const user : User = await this.userRepository.getUserById(userId);
    
        if(status === 'active') {
            user.activate();
        } else if(status === 'suspended') {
            user.suspend();
        } else if(status === 'deleted') {
            user.delete();
        } else {
            throw new Error('User status is invalid')
        }
        const updatedUser = await this.userRepository.updateStatus(user);

        return updatedUser.toJSON();
    }

    async login(data: {
        email: string;
        password: string;
    }): Promise<string> {
        try {
            const user = await this.userRepository.findByEmail(data.email);
            
            if (!user) {
                throw new Error('User not found');
            }

            const checkPassword: boolean = await user.comparePassword(data.password);
            
            if (!checkPassword) {
                throw new Error('Password incorrect');
            }

            if (user.status !== 'active') {
                throw new Error('User account is not active');
            }

            if (user.isVerified === false) {
                throw new Error('Your account not verified yet')
            }
            
            const token: string = await JwtService.generateToken(user.toJSON());

            return token;
        } catch (error: any) {
            throw new Error(`Login failed: ${error.message}`);
        }
    }
}
