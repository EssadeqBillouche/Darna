import { User } from "../../business/entities/User";
import { UserProps } from "../../business/types/User";
import { UserModel } from "../models/UserModel";

export class EmployeeRepository {
  async create(user: User): Promise<User> {
    const data = user.toPersistence();
    
    const created = await UserModel.create({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      password: (data as any).passwordHash,
      phoneNumber: data.phoneNumber,
      role: data.role,
      isVerified: data.isVerified,
      status: data.status,
    });

    const obj = created.toObject();
    obj.id = obj._id.toString();
    return new User(obj as UserProps);
  }
}
