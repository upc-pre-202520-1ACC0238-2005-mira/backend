import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IBusinessRepository } from '../domain/repositories/business.repository.interface';
import type { IBusinessMemberRepository } from '../domain/repositories/business-member.repository.interface';
import { CreateBusinessDto } from './dto/create-business.dto';
import { Business } from '../domain/entities/business.entity';

@Injectable()
export class BusinessService {
  constructor(
    @Inject('IBusinessRepository')
    private readonly businessRepository: IBusinessRepository,
    @Inject('IBusinessMemberRepository')
    private readonly businessMemberRepository: IBusinessMemberRepository,
  ) {}

  async findByUserId(userId: string): Promise<Business[]> {
    // Obtener negocios donde el usuario es dueño
    const ownedBusinesses = await this.businessRepository.findByUserId(userId);
    
    // Obtener negocios donde el usuario es miembro
    const memberRecords = await this.businessMemberRepository.findByUserId(userId);
    const memberBusinessIds = memberRecords.map((member) => member.businessId);
    
    // Obtener los detalles de los negocios donde es miembro
    const memberBusinesses: Business[] = [];
    for (const businessId of memberBusinessIds) {
      try {
        const business = await this.businessRepository.findById(businessId);
        if (business) {
          memberBusinesses.push(business);
        }
      } catch (error) {
        // Si el negocio no existe, continuar
        continue;
      }
    }
    
    // Combinar y eliminar duplicados
    const allBusinesses = [...ownedBusinesses, ...memberBusinesses];
    const uniqueBusinesses = allBusinesses.filter(
      (business, index, self) =>
        index === self.findIndex((b) => b.id === business.id),
    );
    
    return uniqueBusinesses;
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
