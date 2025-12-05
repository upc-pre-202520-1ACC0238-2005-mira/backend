import {
  Injectable,
  Inject,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import type { IAppUserRepository } from '../../user-auth/domain/repositories/app-user.repository.interface';
import { AppUser } from '../../user-auth/domain/entities/app-user.entity';
import { CreateTeamUserDto } from './dto/create-team-user.dto';
import { UserResponse } from '../../user-auth/domain/types/auth-response.types';

@Injectable()
export class TeamService {
  constructor(
    @Inject('IAppUserRepository')
    private readonly appUserRepository: IAppUserRepository,
  ) {}

  async createTeamUser(
    adminId: string,
    createTeamUserDto: CreateTeamUserDto,
  ): Promise<UserResponse> {
    // Verificar que el admin existe
    const admin = await this.appUserRepository.findById(adminId);
    if (!admin) {
      throw new NotFoundException('Admin no encontrado');
    }

    if (admin.role !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden crear usuarios');
    }

    const normalizedEmail = createTeamUserDto.email.toLowerCase().trim();

    // Verificar si el email ya existe
    const existingUser = await this.appUserRepository.findByEmail(
      normalizedEmail,
    );

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(createTeamUserDto.password, 10);

    // Crear usuario de tipo 'user' asociado al admin
    const newUser = await this.appUserRepository.createUser({
      name: createTeamUserDto.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'user',
      image: createTeamUserDto.image,
      createdBy: adminId,
    });

    return this.toUserResponse(newUser);
  }

  async getTeamUsers(adminId: string): Promise<UserResponse[]> {
    // Verificar que el admin existe
    const admin = await this.appUserRepository.findById(adminId);
    if (!admin) {
      throw new NotFoundException('Admin no encontrado');
    }

    if (admin.role !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden ver usuarios del equipo');
    }

    // Obtener solo los usuarios creados por este admin
    const users = await this.appUserRepository.findByCreatedBy(adminId);

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
