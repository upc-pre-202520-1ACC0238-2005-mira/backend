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
import { ExtraccionService } from '../application/extraccion.service';
import { CreateRecetaDto } from '../application/dto/create-receta.dto';
import { UpdateRecetaDto } from '../application/dto/update-receta.dto';

@Controller('extraccion')
export class ExtraccionController {
  constructor(private readonly extraccionService: ExtraccionService) {}

  @Get()
  async findAll(@Query('metodo') metodo?: string) {
    if (metodo) {
      return this.extraccionService.findByMetodo(metodo);
    }
    return this.extraccionService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.extraccionService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRecetaDto: CreateRecetaDto) {
    return this.extraccionService.create(createRecetaDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateRecetaDto: UpdateRecetaDto) {
    return this.extraccionService.update(id, updateRecetaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return this.extraccionService.delete(id);
  }
}
