import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  NotFoundException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { IUserRepository } from '../domain/repositories/user.repository.interface';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from '../domain/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @Inject('IUserRepository')
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
  ) {}

  async register(
    registerDto: RegisterDto,
  ): Promise<{ access_token: string; user: Partial<User> }> {
    const existingUser = await this.userRepository.findByEmail(
      registerDto.email,
    );
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
      role: registerDto.role || 'user',
    });

    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: this.sanitizeUser(user),
    };
  }

  async login(
    loginDto: LoginDto,
  ): Promise<{ access_token: string; user: Partial<User> }> {
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: this.sanitizeUser(user),
    };
  }

  async validateUser(userId: string): Promise<User | null> {
    return this.userRepository.findById(userId);
  }

  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto,
  ): Promise<Partial<User>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateProfileDto.email) {
      const normalizedNewEmail = updateProfileDto.email.toLowerCase();
      const normalizedCurrentEmail = user.email.toLowerCase();
      if (normalizedNewEmail !== normalizedCurrentEmail) {
        const existingUser = await this.userRepository.findByEmail(
          updateProfileDto.email,
        );
        if (existingUser && existingUser.id !== userId) {
          throw new ConflictException('Email already exists');
        }
      }
    }

    if (
      updateProfileDto.name === undefined &&
      updateProfileDto.email === undefined
    ) {
      throw new BadRequestException('No data provided for update');
    }

    const updatePayload: Partial<User> = {};

    if (updateProfileDto.name !== undefined) {
      updatePayload.name = updateProfileDto.name;
    }

    if (updateProfileDto.email !== undefined) {
      updatePayload.email = updateProfileDto.email;
    }

    const updatedUser = await this.userRepository.update(userId, updatePayload);

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return this.sanitizeUser(updatedUser);
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Invalid current password');
    }

    if (changePasswordDto.currentPassword === changePasswordDto.newPassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    const hashedPassword = await bcrypt.hash(
      changePasswordDto.newPassword,
      10,
    );

    await this.userRepository.update(userId, {
      password: hashedPassword,
    });

    return { message: 'Password updated successfully' };
  }

  private sanitizeUser(user: User): Partial<User> {
    const { password, ...rest } = user;
    return rest;
  }
}
