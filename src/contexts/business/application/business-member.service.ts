import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { IBusinessMemberRepository } from '../domain/repositories/business-member.repository.interface';
import type { IBusinessRepository } from '../domain/repositories/business.repository.interface';
import type { IAppUserRepository } from '../../user-auth/domain/repositories/app-user.repository.interface';
import { AddMembersDto } from './dto/add-members.dto';
import { UserResponse } from '../../user-auth/domain/types/auth-response.types';
import { AppUser } from '../../user-auth/domain/entities/app-user.entity';

@Injectable()
export class BusinessMemberService {
  constructor(
    @Inject('IBusinessMemberRepository')
    private readonly businessMemberRepository: IBusinessMemberRepository,
    @Inject('IBusinessRepository')
    private readonly businessRepository: IBusinessRepository,
    @Inject('IAppUserRepository')
    private readonly appUserRepository: IAppUserRepository,
  ) {}

  async getBusinessMembers(businessId: string): Promise<UserResponse[]> {
    const business = await this.businessRepository.findById(businessId);
    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    const users = await this.businessMemberRepository.getUsersByBusinessId(
      businessId,
    );

    return users.map((user) => this.toUserResponse(user));
  }

  async addMembers(
    businessId: string,
    adminId: string,
    addMembersDto: AddMembersDto,
  ): Promise<UserResponse[]> {
    const business = await this.businessRepository.findById(businessId);
    if (!business) {
      throw new NotFoundException('Negocio no encontrado');
    }

    // Verificar que el admin es el dueño del negocio
    if (business.userId !== adminId) {
      throw new ForbiddenException(
        'Solo el dueño del negocio puede agregar miembros',
      );
    }

    // Verificar que todos los usuarios existen y fueron creados por el admin
    for (const userId of addMembersDto.userIds) {
      const user = await this.appUserRepository.findById(userId);
      if (!user) {
        throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
      }

      // Verificar que el usuario fue creado por el admin
      if (user.createdBy !== adminId) {
        throw new ForbiddenException(
          `No puedes agregar usuarios que no creaste`,
        );
      }
    }

    await this.businessMemberRepository.addMembers(
      businessId,
      addMembersDto.userIds,
    );

    const users = await this.businessMemberRepository.getUsersByBusinessId(
      businessId,
    );

    return users.map((user) => this.toUserResponse(user));
  }

  private toUserResponse(user: AppUser): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
