import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TeamService } from '../application/team.service';
import { CreateTeamUserDto } from '../application/dto/create-team-user.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/user.decorator';

@Controller('team')
@UseGuards(JwtAuthGuard)
export class TeamController {
  constructor(private readonly teamService: TeamService) {}

  @Get('users')
  async getTeamUsers(@CurrentUser('sub') adminId: string) {
    return this.teamService.getTeamUsers(adminId);
  }

  @Post('users')
  @HttpCode(HttpStatus.CREATED)
  async createTeamUser(
    @CurrentUser('sub') adminId: string,
    @Body() createTeamUserDto: CreateTeamUserDto,
  ) {
    return this.teamService.createTeamUser(adminId, createTeamUserDto);
  }
}
