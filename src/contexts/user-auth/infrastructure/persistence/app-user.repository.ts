import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import type { IAppUserRepository } from '../../domain/repositories/app-user.repository.interface';
import { AppUser } from '../../domain/entities/app-user.entity';
import { CreateAppUserData } from '../../domain/types/create-app-user-data.types';
import { AppUserDocument } from '../schemas/app-user.schema';

@Injectable()
export class AppUserRepository implements IAppUserRepository {
  constructor(
    @InjectModel(AppUserDocument.name)
    private readonly appUserModel: Model<AppUserDocument>,
  ) {}

  async findAll(): Promise<AppUser[]> {
    const users = await this.appUserModel.find().exec();
    return users.map((user) => this.toEntity(user));
  }

  async findById(id: string): Promise<AppUser | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const user = await this.appUserModel.findById(id).exec();
    return user ? this.toEntity(user) : null;
  }

  async findByEmail(email: string): Promise<AppUser | null> {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await this.appUserModel
      .findOne({ email: normalizedEmail })
      .exec();
    return user ? this.toEntity(user) : null;
  }

  async create(data: Partial<AppUser>): Promise<AppUser> {
    const newUser = new this.appUserModel({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role || 'user',
    });

    const savedUser = await newUser.save();
    return this.toEntity(savedUser);
  }

  async createUser(data: CreateAppUserData): Promise<AppUser> {
    const newUser = new this.appUserModel({
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      image: data.image,
      createdBy: data.createdBy
        ? new Types.ObjectId(data.createdBy)
        : undefined,
    });

    const savedUser = await newUser.save();
    return this.toEntity(savedUser);
  }

  async update(id: string, data: Partial<AppUser>): Promise<AppUser | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }

    const updatedUser = await this.appUserModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();

    return updatedUser ? this.toEntity(updatedUser) : null;
  }

  async delete(id: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(id)) {
      return false;
    }

    const result = await this.appUserModel.findByIdAndDelete(id).exec();
    return result !== null;
  }

  private toEntity(userDoc: AppUserDocument): AppUser {
    const id = userDoc._id instanceof Types.ObjectId
      ? userDoc._id.toString()
      : String(userDoc._id);

    return new AppUser(
      id,
      userDoc.name,
      userDoc.email,
      userDoc.password,
      userDoc.role,
      userDoc.image,
      userDoc.createdBy?.toString(),
      userDoc.createdAt,
      userDoc.updatedAt,
    );
  }

  async findByCreatedBy(createdBy: string): Promise<AppUser[]> {
    const users = await this.appUserModel
      .find({ createdBy: new Types.ObjectId(createdBy) })
      .exec();
    return users.map((user) => this.toEntity(user));
  }
}
