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

  async updateTeamUser(
    adminId: string,
    userId: string,
    updateData: {
      name?: string;
      email?: string;
      password?: string;
      image?: string;
    },
  ): Promise<UserResponse> {
    // Verificar que el admin existe
    const admin = await this.appUserRepository.findById(adminId);
    if (!admin) {
      throw new NotFoundException('Admin no encontrado');
    }

    if (admin.role !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden editar usuarios');
    }

    // Verificar que el usuario existe y fue creado por este admin
    const user = await this.appUserRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.createdBy !== adminId) {
      throw new ForbiddenException('No puedes editar usuarios que no creaste');
    }

    // Si se actualiza el email, verificar que no esté en uso
    if (updateData.email) {
      const normalizedEmail = updateData.email.toLowerCase().trim();
      const existingUser = await this.appUserRepository.findByEmail(normalizedEmail);
      if (existingUser && existingUser.id !== userId) {
        throw new ConflictException('El email ya está registrado');
      }
      updateData.email = normalizedEmail;
    }

    // Si se actualiza la contraseña, hashearla
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Actualizar el usuario
    const updatedUser = await this.appUserRepository.update(userId, updateData);

    if (!updatedUser) {
      throw new NotFoundException('Error al actualizar el usuario');
    }

    return this.toUserResponse(updatedUser);
  }

  async deleteTeamUser(adminId: string, userId: string): Promise<void> {
    // Verificar que el admin existe
    const admin = await this.appUserRepository.findById(adminId);
    if (!admin) {
      throw new NotFoundException('Admin no encontrado');
    }

    if (admin.role !== 'admin') {
      throw new ForbiddenException('Solo los administradores pueden eliminar usuarios');
    }

    // Verificar que el usuario existe y fue creado por este admin
    const user = await this.appUserRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.createdBy !== adminId) {
      throw new ForbiddenException('No puedes eliminar usuarios que no creaste');
    }

    // Eliminar el usuario
    const deleted = await this.appUserRepository.delete(userId);
    if (!deleted) {
      throw new NotFoundException('Error al eliminar el usuario');
    }
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
