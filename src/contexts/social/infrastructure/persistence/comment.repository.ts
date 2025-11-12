import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICommentRepository } from '../../domain/repositories/comment.repository.interface';
import { Comment } from '../../domain/entities/comment.entity';
import { CommentDocument } from '../schemas/comment.schema';

@Injectable()
export class CommentRepository implements ICommentRepository {
  constructor(
    @InjectModel(CommentDocument.name)
    private readonly commentModel: Model<CommentDocument>,
  ) {}

  async create(comment: Comment): Promise<Comment> {
    const newComment = new this.commentModel(comment);
    const savedComment = await newComment.save();
    return this.toEntity(savedComment);
  }

  async findById(id: string): Promise<Comment | null> {
    const comment = await this.commentModel.findById(id).exec();
    return comment ? this.toEntity(comment) : null;
  }

  async findByPostId(postId: string): Promise<Comment[]> {
    const comments = await this.commentModel
      .find({ postId, parentCommentId: null })
      .sort({ createdAt: 1 })
      .exec();
    return comments.map((comment) => this.toEntity(comment));
  }

  async findRepliesByCommentId(commentId: string): Promise<Comment[]> {
    const replies = await this.commentModel
      .find({ parentCommentId: commentId })
      .sort({ createdAt: 1 })
      .exec();
    return replies.map((reply) => this.toEntity(reply));
  }

  async incrementRepliesCount(commentId: string): Promise<void> {
    await this.commentModel
      .findByIdAndUpdate(commentId, { $inc: { repliesCount: 1 } })
      .exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.commentModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  private toEntity(commentDoc: CommentDocument): Comment {
    return {
      id: (commentDoc._id as any).toString(),
      postId: commentDoc.postId,
      userId: commentDoc.userId,
      userName: commentDoc.userName,
      content: commentDoc.content,
      parentCommentId: commentDoc.parentCommentId,
      repliesCount: commentDoc.repliesCount,
      createdAt: commentDoc.createdAt,
      updatedAt: commentDoc.updatedAt,
    };
  }
}

