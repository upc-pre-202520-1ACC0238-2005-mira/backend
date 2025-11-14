import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import type { IRecetaRepository } from '../domain/repositories/receta.repository.interface';
import type { IHistorialExtraccionRepository } from '../domain/repositories/historial-extraccion.repository.interface';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';
import { CompleteExtractionDto } from './dto/complete-extraction.dto';
import { GuardarExtraccionDto } from './dto/guardar-extraccion.dto';
import { Receta } from '../domain/entities/receta.entity';
import { HistorialExtraccion } from '../domain/entities/historial-extraccion.entity';
import { SocialService } from '../../social/application/social.service';
import type { IBolsaCafeRepository } from '../domain/repositories/bolsa-cafe.repository.interface';
import { BolsaCafe } from '../domain/entities/bolsa-cafe.entity';
import { CreateBolsaCafeDto } from './dto/create-bolsa-cafe.dto';
import { UpdateBolsaCafeDto } from './dto/update-bolsa-cafe.dto';
import { ConsumirBolsaCafeDto } from './dto/consumir-bolsa-cafe.dto';

@Injectable()
export class ExtraccionService {
  constructor(
    @Inject('IRecetaRepository')
    private readonly recetaRepository: IRecetaRepository,
    @Inject('IHistorialExtraccionRepository')
    private readonly historialRepository: IHistorialExtraccionRepository,
    @Inject('IBolsaCafeRepository')
    private readonly bolsaCafeRepository: IBolsaCafeRepository,
    private readonly socialService: SocialService,
  ) {}

  async findAll(): Promise<Receta[]> {
    return this.recetaRepository.findAll();
  }

  async findById(id: string): Promise<Receta> {
    const receta = await this.recetaRepository.findById(id);
    if (!receta) {
      throw new NotFoundException(`Receta with id ${id} not found`);
    }
    return receta;
  }

  async findByMetodo(metodo: string): Promise<Receta[]> {
    return this.recetaRepository.findByMetodo(metodo);
  }

  async findRecetasPorDefecto(): Promise<Receta[]> {
    const todasRecetas = await this.recetaRepository.findAll();
    return todasRecetas.filter((receta) => receta.esPorDefecto === true);
  }

  async findByUsuarioId(usuarioId: string, limit?: number): Promise<Receta[]> {
    return this.recetaRepository.findByUsuarioId(usuarioId, limit);
  }

  async create(createRecetaDto: CreateRecetaDto): Promise<Receta> {
    return this.recetaRepository.create(createRecetaDto);
  }

  async update(id: string, updateRecetaDto: UpdateRecetaDto): Promise<Receta> {
    const receta = await this.recetaRepository.update(id, updateRecetaDto);
    if (!receta) {
      throw new NotFoundException(`Receta with id ${id} not found`);
    }
    return receta;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.recetaRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Receta with id ${id} not found`);
    }
  }

  async completeExtraction(
    userId: string,
    userName: string,
    userEmail: string,
    completeDto: CompleteExtractionDto,
  ): Promise<{ receta: Receta; postId?: string }> {
    // Obtener la receta
    const receta = await this.recetaRepository.findById(completeDto.recetaId);
    if (!receta) {
      throw new NotFoundException(
        `Receta with id ${completeDto.recetaId} not found`,
      );
    }

    // Actualizar receta con notas de cata y calificaciones
    const updatedReceta = await this.recetaRepository.update(
      completeDto.recetaId,
      {
        notas: completeDto.notasDeCata,
        calificacion: completeDto.sabor, // Usar sabor como calificación general
      },
    );

    if (!updatedReceta) {
      throw new NotFoundException('Error updating receta');
    }

    if (
      completeDto.bolsaCafeId &&
      completeDto.gramosCafeUtilizados &&
      completeDto.gramosCafeUtilizados > 0
    ) {
      await this.consumirBolsaCafeUsuario(userId, {
        bolsaId: completeDto.bolsaCafeId,
        gramos: completeDto.gramosCafeUtilizados,
      });
    }

    // Si se debe publicar en social, crear el post
    let postId: string | undefined;
    if (completeDto.publishToSocial) {
      const postContent = `🔖 Método: ${receta.nombre}\n\n📝 Notas de cata:\n${completeDto.notasDeCata}\n\n${
        completeDto.sabor
          ? `⭐ Sabor: ${completeDto.sabor}/5\n`
          : ''
      }${completeDto.aroma ? `🌸 Aroma: ${completeDto.aroma}/5\n` : ''}${
        completeDto.cuerpo
          ? `💪 Cuerpo: ${completeDto.cuerpo}/5\n`
          : ''
      }${completeDto.acidez ? `🍋 Acidez: ${completeDto.acidez}/5` : ''}`;

      const post = await this.socialService.createPost(
        userId,
        userName,
        userEmail,
        {
          content: postContent,
          imageUrl: completeDto.imageUrl,
          extractionId: completeDto.recetaId,
        },
      );

      postId = post.id;
    }

    return {
      receta: updatedReceta,
      postId,
    };
  }

  // Historial de extracciones
  async guardarExtraccion(
    userId: string,
    guardarDto: GuardarExtraccionDto,
  ): Promise<HistorialExtraccion> {
    const historial = new HistorialExtraccion(
      userId,
      guardarDto.metodoNombre,
      guardarDto.valoracionGeneral,
      guardarDto.perfilSensorial,
      guardarDto.notasSensoriales,
    );

    if (
      guardarDto.bolsaCafeId &&
      guardarDto.gramosCafeUtilizados &&
      guardarDto.gramosCafeUtilizados > 0
    ) {
      await this.consumirBolsaCafeUsuario(userId, {
        bolsaId: guardarDto.bolsaCafeId,
        gramos: guardarDto.gramosCafeUtilizados,
      });
    }

    return this.historialRepository.create(historial);
  }

  async obtenerHistorialUsuario(userId: string): Promise<HistorialExtraccion[]> {
    return this.historialRepository.findByUserId(userId);
  }

  async eliminarHistorial(userId: string, historialId: string): Promise<void> {
    const historial = await this.historialRepository.findById(historialId);
    if (!historial) {
      throw new NotFoundException(`Historial with id ${historialId} not found`);
    }
    if (historial.userId !== userId) {
      throw new NotFoundException(
        'No tienes permiso para eliminar este historial',
      );
    }
    await this.historialRepository.delete(historialId);
  }

  // Bolsas de café
  async crearBolsaCafe(
    usuarioId: string,
    createDto: CreateBolsaCafeDto,
  ): Promise<BolsaCafe> {
    const bolsa = new BolsaCafe(
      usuarioId,
      createDto.nombre,
      createDto.pesoInicial,
      createDto.pesoRestante,
      createDto.origen,
      createDto.tostador,
      createDto.varietal,
      createDto.notas,
      createDto.moliendaSugerida,
    );

    return this.bolsaCafeRepository.create(bolsa);
  }

  async obtenerBolsasPorUsuario(usuarioId: string): Promise<BolsaCafe[]> {
    return this.bolsaCafeRepository.findByUsuarioId(usuarioId);
  }

  async actualizarBolsaCafe(
    usuarioId: string,
    bolsaId: string,
    updateDto: UpdateBolsaCafeDto,
  ): Promise<BolsaCafe> {
    await this.assertBolsaOwnership(usuarioId, bolsaId);
    const updated = await this.bolsaCafeRepository.update(bolsaId, updateDto);
    if (!updated) {
      throw new NotFoundException('Bolsa de café no encontrada');
    }
    return updated;
  }

  async eliminarBolsaCafe(usuarioId: string, bolsaId: string): Promise<void> {
    await this.assertBolsaOwnership(usuarioId, bolsaId);
    const deleted = await this.bolsaCafeRepository.delete(bolsaId);
    if (!deleted) {
      throw new NotFoundException('Bolsa de café no encontrada');
    }
  }

  async findHistorialById(id: string): Promise<HistorialExtraccion | null> {
    return this.historialRepository.findById(id);
  }

  async consumirBolsaCafeUsuario(
    usuarioId: string,
    consumirDto: ConsumirBolsaCafeDto,
  ): Promise<BolsaCafe> {
    await this.assertBolsaOwnership(usuarioId, consumirDto.bolsaId);
    return this.bolsaCafeRepository.consumirCafe(
      consumirDto.bolsaId,
      consumirDto.gramos,
    );
  }

  private async assertBolsaOwnership(usuarioId: string, bolsaId: string) {
    const bolsa = await this.bolsaCafeRepository.findById(bolsaId);
    if (!bolsa) {
      throw new NotFoundException('Bolsa de café no encontrada');
    }
    if (bolsa.usuarioId !== usuarioId) {
      throw new ForbiddenException('No tienes acceso a esta bolsa de café');
    }
  }
}
