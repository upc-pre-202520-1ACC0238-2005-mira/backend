import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExtraccionController } from './interfaces/extraccion.controller';
import { ExtraccionService } from './application/extraccion.service';
import { RecetaRepository } from './infrastructure/persistence/receta.repository';
import {
  RecetaDocument,
  RecetaSchema,
} from './infrastructure/schemas/receta.schema';

@Module({
  imports: [
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
  ],
  exports: [ExtraccionService],
})
export class ExtraccionModule {}
