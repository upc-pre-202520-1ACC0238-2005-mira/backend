import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessController } from './interfaces/business.controller';
import { BusinessService } from './application/business.service';
import { BusinessRepository } from './infrastructure/persistence/business.repository';
import {
  BusinessDocument,
  BusinessSchema,
} from './infrastructure/schemas/business.schema';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    SharedModule,
    MongooseModule.forFeature([
      { name: BusinessDocument.name, schema: BusinessSchema },
    ]),
  ],
  controllers: [BusinessController],
  providers: [
    BusinessService,
    {
      provide: 'IBusinessRepository',
      useClass: BusinessRepository,
    },
  ],
  exports: [BusinessService],
})
export class BusinessModule {}
