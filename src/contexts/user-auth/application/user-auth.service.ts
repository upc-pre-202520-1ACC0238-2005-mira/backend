import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { IAppUserRepository } from '../domain/repositories/app-user.repository.interface';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AppUser } from '../domain/entities/app-user.entity';
import { AuthResponse, UserResponse } from '../domain/types/auth-response.types';

@Injectable()
export class UserAuthService {
  constructor(
    @Inject('IAppUserRepository')
    private readonly appUserRepository: IAppUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const normalizedEmail = registerDto.email.toLowerCase().trim();

    const existingUser = await this.appUserRepository.findByEmail(
      normalizedEmail,
    );

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const newUser = await this.appUserRepository.createUser({
      name: registerDto.name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: 'admin', // Los que se registran son dueños (admin)
      image: registerDto.image,
    });

    const accessToken = this.generateAccessToken(newUser);
    const userResponse = this.toUserResponse(newUser);

    return {
      access_token: accessToken,
      user: userResponse,
    };
  }

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const normalizedEmail = loginDto.email.toLowerCase().trim();

    const user = await this.appUserRepository.findByEmail(normalizedEmail);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const accessToken = this.generateAccessToken(user);
    const userResponse = this.toUserResponse(user);

    return {
      access_token: accessToken,
      user: userResponse,
    };
  }

  private generateAccessToken(user: AppUser): string {
    const payload = {
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<UserResponse> {
    const user = await this.appUserRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar si el email cambió y si ya existe
    if (updateProfileDto.email) {
      const normalizedNewEmail = updateProfileDto.email.toLowerCase().trim();
      const normalizedCurrentEmail = user.email.toLowerCase();

      if (normalizedNewEmail !== normalizedCurrentEmail) {
        const existingUser = await this.appUserRepository.findByEmail(
          normalizedNewEmail,
        );

        if (existingUser && existingUser.id !== userId) {
          throw new ConflictException('El email ya está en uso');
        }
      }
    }

    // Construir payload de actualización
    const updatePayload: {
      name?: string;
      email?: string;
      image?: string;
    } = {};

    if (updateProfileDto.name !== undefined) {
      updatePayload.name = updateProfileDto.name.trim();
    }

    if (updateProfileDto.email !== undefined) {
      updatePayload.email = updateProfileDto.email.toLowerCase().trim();
    }

    if (updateProfileDto.image !== undefined) {
      updatePayload.image = updateProfileDto.image;
    }

    const updatedUser = await this.appUserRepository.update(
      userId,
      updatePayload as Partial<AppUser>,
    );

    if (!updatedUser) {
      throw new NotFoundException('Usuario no encontrado');
    }

    return this.toUserResponse(updatedUser);
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
