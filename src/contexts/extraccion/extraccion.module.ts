import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExtraccionController } from './interfaces/extraccion.controller';
import { ExtraccionService } from './application/extraccion.service';
import { RecetaRepository } from './infrastructure/persistence/receta.repository';
import {
  RecetaDocument,
  RecetaSchema,
} from './infrastructure/schemas/receta.schema';
import { ExtraccionSeeder } from './infrastructure/seeds/extraccion.seeder';
import { SocialModule } from '../social/social.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    SharedModule,
    SocialModule,
    MongooseModule.forFeature([
      { name: RecetaDocument.name, schema: RecetaSchema },
    ]),
  ],
  controllers: [ExtraccionController],
  providers: [
    ExtraccionService,
    {
      provide: 'IRecetaRepository',
      useClass: RecetaRepository,
    },
    ExtraccionSeeder,
  ],
  exports: [ExtraccionService],
})
export class ExtraccionModule {}
