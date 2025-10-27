import { UserModel } from '../models/UserModel';
import { User } from '../../business/entities/User';
import { UserProps } from '../../business/types/User';

class UserRepository {

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email });
    return user ? new User(user.toObject() as UserProps) : null;
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    const user = await UserModel.findOne({ verificationToken: token });
    return user ? new User(user.toObject() as UserProps) : null;
  }

  async create(user: User): Promise<User> {
    try {
      const saved = await UserModel.create({
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        password: (user as any)._passwordHash,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isVerified: false,
        status: 'active',
      });
      return new User(saved.toObject() as UserProps);
    } catch (error: any) {
      throw new Error(error.message)
    }
  }

  async update(user: User): Promise<User> {
    if (!user.id) throw new Error('Cannot update a user without an identifier');

    const persistence = user.toPersistence();
    const { createdAt, ...updatePayload } = persistence;

    const updated = await UserModel.findByIdAndUpdate(
      user.id,
      updatePayload,
      { new: true },
    );

    if(!updated) throw new Error('User not updated')
    return new User(updated.toObject() as UserProps);
  }
}

export default UserRepository;
