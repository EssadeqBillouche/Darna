import { UserModel } from '../models/UserModel';
import { User } from '../../business/entities/User';
import { UserProps } from '../../business/types/User';

const toUserEntity = (document: any): User | null => {
  if (!document) return null;
  const plain = document.toObject();
  const props: UserProps = {
    id: plain._id?.toString(),
    email: plain.email,
    firstName: plain.firstName,
    lastName: plain.lastName,
    password: plain.password,
    phoneNumber: plain.phoneNumber,
    role: plain.role,
    isVerified: plain.isVerified,
    profilePicture: plain.profilePicture,
    status: plain.status,
    createdAt: plain.createdAt,
    updatedAt: plain.updatedAt,
    verificationToken: plain.verificationToken,
    verificationTokenExpiresAt: plain.verificationTokenExpiresAt,
  };

  return new User(props);
};

class UserRepository {

  async findByEmail(email: string): Promise<User | null> {
    const user = await UserModel.findOne({ email });
    return toUserEntity(user);
  }

  async findByVerificationToken(token: string): Promise<User | null> {
    const user = await UserModel.findOne({ verificationToken: token });
    return toUserEntity(user);
  }

  async create(user: User): Promise<User> {
    try {
      const saved = await UserModel.create(user.toPersistence());
      const entity = toUserEntity(saved);
      if (!entity) throw new Error('Failed to create user');
      return entity;
    } catch (error: any) {
      throw new Error(`Error: ${error.message}`);
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

    const entity = toUserEntity(updated);
    if (!entity) throw new Error('User not found');
    return entity;
  }
}

export default UserRepository;
