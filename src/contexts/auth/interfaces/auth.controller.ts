import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Put,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from '../application/auth.service';
import { RegisterDto } from '../application/dto/register.dto';
import { LoginDto } from '../application/dto/login.dto';
import { UpdateProfileDto } from '../application/dto/update-profile.dto';
import { ChangePasswordDto } from '../application/dto/change-password.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getProfile(@CurrentUser('sub') userId: string) {
    return this.authService.getProfile(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(userId, updateProfileDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @CurrentUser('sub') userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, changePasswordDto);
  }
}
