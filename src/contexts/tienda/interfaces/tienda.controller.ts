import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TiendaService } from '../application/tienda.service';
import { CreateProductoDto } from '../application/dto/create-producto.dto';
import { UpdateProductoDto } from '../application/dto/update-producto.dto';

@Controller('tienda')
export class TiendaController {
  constructor(private readonly tiendaService: TiendaService) {}

  @Get()
  async findAll(@Query('nombre') nombre?: string, @Query('inStock') inStock?: string) {
    if (nombre) {
      return this.tiendaService.findByName(nombre);
    }
    if (inStock === 'true') {
      return this.tiendaService.findInStock();
    }
    return this.tiendaService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.tiendaService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProductoDto: CreateProductoDto) {
    return this.tiendaService.create(createProductoDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateProductoDto: UpdateProductoDto) {
    return this.tiendaService.update(id, updateProductoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return this.tiendaService.delete(id);
  }
}
