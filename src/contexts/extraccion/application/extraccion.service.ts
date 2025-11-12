import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IRecetaRepository } from '../domain/repositories/receta.repository.interface';
import { CreateRecetaDto } from './dto/create-receta.dto';
import { UpdateRecetaDto } from './dto/update-receta.dto';
import { CompleteExtractionDto } from './dto/complete-extraction.dto';
import { Receta } from '../domain/entities/receta.entity';
import { SocialService } from '../../social/application/social.service';

@Injectable()
export class ExtraccionService {
  constructor(
    @Inject('IRecetaRepository')
    private readonly recetaRepository: IRecetaRepository,
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
}
