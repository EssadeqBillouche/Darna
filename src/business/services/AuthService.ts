import { User } from '../../business/entities/User';
import { UserRole } from '../../business/enums/Role';
import UserRepository from '../../persistence/repositories/UserRepository';

export class AuthService {
    private UserRepository : UserRepository;

    constructor(UserRepository: UserRepository) {
        this.UserRepository = UserRepository;
    }

    async register(data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        phoneNumber?: string;
        role: UserRole;
    }) : Promise<User> {
        try {
            const existing = await this.UserRepository.findByEmail(data.email);
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
            
    
            const savedUser = await this.UserRepository.create(userEntity);
            return savedUser.toPersistence();
        } catch (error: any) {
            throw new Error(`Error: ${error.message}`)
        }
    }
}
