import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TeamService } from '../application/team.service';
import { CreateTeamUserDto } from '../application/dto/create-team-user.dto';
import { UpdateTeamUserDto } from '../application/dto/update-team-user.dto';
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

  @Put('users/:id')
  async updateTeamUser(
    @CurrentUser('sub') adminId: string,
    @Param('id') userId: string,
    @Body() updateTeamUserDto: UpdateTeamUserDto,
  ) {
    return this.teamService.updateTeamUser(adminId, userId, updateTeamUserDto);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTeamUser(
    @CurrentUser('sub') adminId: string,
    @Param('id') userId: string,
  ) {
    await this.teamService.deleteTeamUser(adminId, userId);
  }
}
