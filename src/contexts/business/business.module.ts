import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessController } from './interfaces/business.controller';
import { BusinessService } from './application/business.service';
import { BusinessMemberService } from './application/business-member.service';
import { BusinessRepository } from './infrastructure/persistence/business.repository';
import { BusinessMemberRepository } from './infrastructure/persistence/business-member.repository';
import {
  BusinessDocument,
  BusinessSchema,
} from './infrastructure/schemas/business.schema';
import {
  BusinessMemberDocument,
  BusinessMemberSchema,
} from './infrastructure/schemas/business-member.schema';
import { SharedModule } from '../shared/shared.module';
import { UserAuthModule } from '../user-auth/user-auth.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    SharedModule,
    UserAuthModule,
    forwardRef(() => NotificationsModule),
    MongooseModule.forFeature([
      { name: BusinessDocument.name, schema: BusinessSchema },
      { name: BusinessMemberDocument.name, schema: BusinessMemberSchema },
    ]),
  ],
  controllers: [BusinessController],
  providers: [
    BusinessService,
    BusinessMemberService,
    {
      provide: 'IBusinessRepository',
      useClass: BusinessRepository,
    },
    {
      provide: 'IBusinessMemberRepository',
      useClass: BusinessMemberRepository,
    },
  ],
  exports: [
    BusinessService,
    BusinessMemberService,
    'IBusinessRepository',
    'IBusinessMemberRepository',
  ],
})
export class BusinessModule {}
