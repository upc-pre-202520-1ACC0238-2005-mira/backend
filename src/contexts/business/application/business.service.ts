import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IBusinessRepository } from '../domain/repositories/business.repository.interface';
import { CreateBusinessDto } from './dto/create-business.dto';
import { Business } from '../domain/entities/business.entity';

@Injectable()
export class BusinessService {
  constructor(
    @Inject('IBusinessRepository')
    private readonly businessRepository: IBusinessRepository,
  ) {}

  async findByUserId(userId: string): Promise<Business[]> {
    return this.businessRepository.findByUserId(userId);
  }

  async findById(id: string): Promise<Business> {
    const business = await this.businessRepository.findById(id);
    if (!business) {
      throw new NotFoundException(`Business with id ${id} not found`);
    }
    return business;
  }

  async create(
    userId: string,
    createBusinessDto: CreateBusinessDto,
  ): Promise<Business> {
    return this.businessRepository.create({
      ...createBusinessDto,
      userId,
    });
  }
}
