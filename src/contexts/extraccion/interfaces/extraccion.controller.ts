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
  UseGuards,
} from '@nestjs/common';
import { ExtraccionService } from '../application/extraccion.service';
import { CreateRecetaDto } from '../application/dto/create-receta.dto';
import { UpdateRecetaDto } from '../application/dto/update-receta.dto';
import { CompleteExtractionDto } from '../application/dto/complete-extraction.dto';
import { GuardarExtraccionDto } from '../application/dto/guardar-extraccion.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/user.decorator';

@Controller('extraccion')
export class ExtraccionController {
  constructor(private readonly extraccionService: ExtraccionService) {}

  @Get()
  async findAll(
    @Query('metodo') metodo?: string,
    @Query('usuarioId') usuarioId?: string,
    @Query('limit') limit?: string,
  ) {
    if (usuarioId) {
      const parsedLimit =
        limit !== undefined && !Number.isNaN(Number(limit))
          ? Number(limit)
          : undefined;
      return this.extraccionService.findByUsuarioId(usuarioId, parsedLimit);
    }
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
  async update(
    @Param('id') id: string,
    @Body() updateRecetaDto: UpdateRecetaDto,
  ) {
    return this.extraccionService.update(id, updateRecetaDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return this.extraccionService.delete(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('complete')
  @HttpCode(HttpStatus.CREATED)
  async completeExtraction(
    @CurrentUser('sub') userId: string,
    @CurrentUser('name') userName: string,
    @CurrentUser('email') userEmail: string,
    @Body() completeDto: CompleteExtractionDto,
  ) {
    return this.extraccionService.completeExtraction(
      userId,
      userName,
      userEmail,
      completeDto,
    );
  }

  // Historial de extracciones
  @UseGuards(JwtAuthGuard)
  @Post('historial')
  @HttpCode(HttpStatus.CREATED)
  async guardarHistorial(
    @CurrentUser('sub') userId: string,
    @Body() guardarDto: GuardarExtraccionDto,
  ) {
    return this.extraccionService.guardarExtraccion(userId, guardarDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('historial/usuario')
  @HttpCode(HttpStatus.OK)
  async obtenerHistorial(@CurrentUser('sub') userId: string) {
    return this.extraccionService.obtenerHistorialUsuario(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('historial/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async eliminarHistorial(
    @CurrentUser('sub') userId: string,
    @Param('id') historialId: string,
  ) {
    return this.extraccionService.eliminarHistorial(userId, historialId);
  }
}
