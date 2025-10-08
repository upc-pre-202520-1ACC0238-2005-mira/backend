import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IPostRepository } from '../../domain/repositories/post.repository.interface';
import { Post } from '../../domain/entities/post.entity';
import { PostDocument } from '../schemas/post.schema';

@Injectable()
export class PostRepository implements IPostRepository {
  constructor(
    @InjectModel(PostDocument.name)
    private readonly postModel: Model<PostDocument>,
  ) {}

  async findAll(): Promise<Post[]> {
    const posts = await this.postModel.find().sort({ fecha: -1 }).exec();
    return posts.map((post) => this.toEntity(post));
  }

  async findById(id: string): Promise<Post | null> {
    const post = await this.postModel.findById(id).exec();
    return post ? this.toEntity(post) : null;
  }

  async findByAutor(autor: string): Promise<Post[]> {
    const posts = await this.postModel.find({ autor }).sort({ fecha: -1 }).exec();
    return posts.map((post) => this.toEntity(post));
  }

  async create(data: Partial<Post>): Promise<Post> {
    const newPost = new this.postModel(data);
    const savedPost = await newPost.save();
    return this.toEntity(savedPost);
  }

  async update(id: string, data: Partial<Post>): Promise<Post | null> {
    const updatedPost = await this.postModel
      .findByIdAndUpdate(id, data, { new: true })
      .exec();
    return updatedPost ? this.toEntity(updatedPost) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.postModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  async incrementLikes(id: string): Promise<Post | null> {
    const updatedPost = await this.postModel
      .findByIdAndUpdate(id, { $inc: { likes: 1 } }, { new: true })
      .exec();
    return updatedPost ? this.toEntity(updatedPost) : null;
  }

  private toEntity(postDoc: PostDocument): Post {
    return {
      id: (postDoc._id as any).toString(),
      autor: postDoc.autor,
      contenido: postDoc.contenido,
      fecha: postDoc.fecha,
      likes: postDoc.likes,
      createdAt: postDoc.createdAt,
      updatedAt: postDoc.updatedAt,
    };
  }
}
