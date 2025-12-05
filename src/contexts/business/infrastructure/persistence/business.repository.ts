import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { IBusinessRepository } from '../../domain/repositories/business.repository.interface';
import { Business } from '../../domain/entities/business.entity';
import { BusinessDocument } from '../schemas/business.schema';

@Injectable()
export class BusinessRepository implements IBusinessRepository {
  constructor(
    @InjectModel(BusinessDocument.name)
    private readonly businessModel: Model<BusinessDocument>,
  ) {}

  async findAll(): Promise<Business[]> {
    const businesses = await this.businessModel.find().exec();
    return businesses.map((business) => this.toEntity(business));
  }

  async findById(id: string): Promise<Business | null> {
    const business = await this.businessModel.findById(id).exec();
    return business ? this.toEntity(business) : null;
  }

  async findByUserId(userId: string): Promise<Business[]> {
    const businesses = await this.businessModel
      .find({ userId: new Types.ObjectId(userId) })
      .exec();
    return businesses.map((business) => this.toEntity(business));
  }

  async create(data: Partial<Business>): Promise<Business> {
    const newBusiness = new this.businessModel({
      ...data,
      userId: new Types.ObjectId(data.userId),
    });
    const savedBusiness = await newBusiness.save();
    return this.toEntity(savedBusiness);
  }

  async update(
    id: string,
    data: Partial<Business>,
  ): Promise<Business | null> {
    const updateData = { ...data };
    if (data.userId) {
      updateData.userId = new Types.ObjectId(data.userId) as any;
    }

    const updatedBusiness = await this.businessModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    return updatedBusiness ? this.toEntity(updatedBusiness) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.businessModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  private toEntity(businessDoc: BusinessDocument): Business {
    return {
      id: (businessDoc._id as any).toString(),
      name: businessDoc.name,
      type: businessDoc.type,
      phone: businessDoc.phone,
      address: businessDoc.address,
      description: businessDoc.description,
      logo: businessDoc.logo,
      userId: businessDoc.userId.toString(),
      createdAt: businessDoc.createdAt,
      updatedAt: businessDoc.updatedAt,
    };
  }
}
