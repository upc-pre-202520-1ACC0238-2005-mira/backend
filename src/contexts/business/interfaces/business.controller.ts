import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { BusinessService } from '../application/business.service';
import { BusinessMemberService } from '../application/business-member.service';
import { CreateBusinessDto } from '../application/dto/create-business.dto';
import { AddMembersDto } from '../application/dto/add-members.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/user.decorator';

@Controller('business')
@UseGuards(JwtAuthGuard)
export class BusinessController {
  constructor(
    private readonly businessService: BusinessService,
    private readonly businessMemberService: BusinessMemberService,
  ) {}

  @Get()
  async findAllByUser(@CurrentUser('sub') userId: string) {
    return this.businessService.findByUserId(userId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.businessService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser('sub') userId: string,
    @Body() createBusinessDto: CreateBusinessDto,
  ) {
    return this.businessService.create(userId, createBusinessDto);
  }

  @Get(':id/members')
  async getBusinessMembers(@Param('id') businessId: string) {
    return this.businessMemberService.getBusinessMembers(businessId);
  }

  @Post(':id/members')
  @HttpCode(HttpStatus.OK)
  async addMembers(
    @Param('id') businessId: string,
    @CurrentUser('sub') adminId: string,
    @Body() addMembersDto: AddMembersDto,
  ) {
    return this.businessMemberService.addMembers(
      businessId,
      adminId,
      addMembersDto,
    );
  }
}
