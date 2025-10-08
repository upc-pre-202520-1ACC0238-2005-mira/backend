import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { UserDocument } from '../schemas/user.schema';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectModel(UserDocument.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async findAll(): Promise<User[]> {
    const users = await this.userModel.find().exec();
    return users.map((user) => this.toEntity(user));
  }

  async findById(id: string): Promise<User | null> {
    const user = await this.userModel.findById(id).exec();
    return user ? this.toEntity(user) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email }).exec();
    return user ? this.toEntity(user) : null;
  }

  async create(data: Partial<User>): Promise<User> {
    const newUser = new this.userModel(data);
    const savedUser = await newUser.save();
    return this.toEntity(savedUser);
  }

  async update(id: string, data: Partial<User>): Promise<User | null> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    return updatedUser ? this.toEntity(updatedUser) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  private toEntity(userDoc: UserDocument): User {
    return {
      id: (userDoc._id as any).toString(),
      name: userDoc.name,
      email: userDoc.email,
      password: userDoc.password,
      role: userDoc.role,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
    };
  }
}
