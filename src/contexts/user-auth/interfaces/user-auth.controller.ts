import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Put,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { UserAuthService } from '../application/user-auth.service';
import { RegisterDto } from '../application/dto/register.dto';
import { LoginDto } from '../application/dto/login.dto';
import { UpdateProfileDto } from '../application/dto/update-profile.dto';
import { ChangePasswordDto } from '../application/dto/change-password.dto';
import { AuthResponse, UserResponse } from '../domain/types/auth-response.types';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/user.decorator';

@Controller('user-auth')
export class UserAuthController {
  constructor(private readonly userAuthService: UserAuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.userAuthService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.userAuthService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<UserResponse> {
    return this.userAuthService.updateProfile(userId, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser('sub') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    return this.userAuthService.changePassword(userId, changePasswordDto);
  }
}
