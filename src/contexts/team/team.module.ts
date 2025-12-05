import { Module } from '@nestjs/common';
import { TeamController } from './interfaces/team.controller';
import { TeamService } from './application/team.service';
import { UserAuthModule } from '../user-auth/user-auth.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [UserAuthModule, SharedModule],
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}
