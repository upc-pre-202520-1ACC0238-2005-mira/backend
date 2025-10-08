import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IPostRepository } from '../domain/repositories/post.repository.interface';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from '../domain/entities/post.entity';

@Injectable()
export class SocialService {
  constructor(
    @Inject('IPostRepository')
    private readonly postRepository: IPostRepository,
  ) {}

  async findAll(): Promise<Post[]> {
    return this.postRepository.findAll();
  }

  async findById(id: string): Promise<Post> {
    const post = await this.postRepository.findById(id);
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    return post;
  }

  async findByAutor(autor: string): Promise<Post[]> {
    return this.postRepository.findByAutor(autor);
  }

  async create(createPostDto: CreatePostDto): Promise<Post> {
    return this.postRepository.create({
      ...createPostDto,
      fecha: createPostDto.fecha || new Date(),
      likes: 0,
    });
  }

  async update(id: string, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.postRepository.update(id, updatePostDto);
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    return post;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.postRepository.delete(id);
    if (!deleted) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
  }

  async likePost(id: string): Promise<Post> {
    const post = await this.postRepository.incrementLikes(id);
    if (!post) {
      throw new NotFoundException(`Post with id ${id} not found`);
    }
    return post;
  }
}
