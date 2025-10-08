import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TiendaController } from './interfaces/tienda.controller';
import { TiendaService } from './application/tienda.service';
import { ProductoRepository } from './infrastructure/persistence/producto.repository';
import { ProductoDocument, ProductoSchema } from './infrastructure/schemas/producto.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ProductoDocument.name, schema: ProductoSchema },
    ]),
  ],
  controllers: [TiendaController],
  providers: [
    TiendaService,
    {
      provide: 'IProductoRepository',
      useClass: ProductoRepository,
    },
  ],
  exports: [TiendaService],
})
export class TiendaModule {}
