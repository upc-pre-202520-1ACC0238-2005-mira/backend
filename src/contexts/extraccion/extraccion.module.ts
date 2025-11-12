import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExtraccionController } from './interfaces/extraccion.controller';
import { ExtraccionService } from './application/extraccion.service';
import { RecetaRepository } from './infrastructure/persistence/receta.repository';
import { HistorialExtraccionRepository } from './infrastructure/persistence/historial-extraccion.repository';
import {
  RecetaDocument,
  RecetaSchema,
} from './infrastructure/schemas/receta.schema';
import {
  HistorialExtraccionDocument,
  HistorialExtraccionSchema,
} from './infrastructure/schemas/historial-extraccion.schema';
import { ExtraccionSeeder } from './infrastructure/seeds/extraccion.seeder';
import { SocialModule } from '../social/social.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    SharedModule,
    SocialModule,
    MongooseModule.forFeature([
      { name: RecetaDocument.name, schema: RecetaSchema },
      {
        name: HistorialExtraccionDocument.name,
        schema: HistorialExtraccionSchema,
      },
    ]),
  ],
  controllers: [ExtraccionController],
  providers: [
    ExtraccionService,
    {
      provide: 'IRecetaRepository',
      useClass: RecetaRepository,
    },
    {
      provide: 'IHistorialExtraccionRepository',
      useClass: HistorialExtraccionRepository,
    },
    ExtraccionSeeder,
  ],
  exports: [ExtraccionService],
})
export class ExtraccionModule {}
