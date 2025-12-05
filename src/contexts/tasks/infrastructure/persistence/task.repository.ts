import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task as TaskEntity } from '../../domain/entities/task.entity';
import { ITaskRepository } from '../../domain/repositories/task.repository.interface';
import { TaskDocument, Task } from '../schemas/task.schema';

@Injectable()
export class TaskRepository implements ITaskRepository {
  constructor(
    @InjectModel(Task.name)
    private readonly taskModel: Model<TaskDocument>,
  ) {}

  async create(task: TaskEntity): Promise<TaskEntity> {
    const createdTask = new this.taskModel({
      title: task.title,
      description: task.description,
      businessId: task.businessId,
      assignedToUserId: task.assignedToUserId,
      assignedByUserId: task.assignedByUserId,
      images: task.images,
      status: task.status,
    });

    const savedTask = await createdTask.save();
    return this.toEntity(savedTask);
  }

  async findById(id: string): Promise<TaskEntity | null> {
    const task = await this.taskModel.findById(id).exec();
    return task ? this.toEntity(task) : null;
  }

  async findByBusinessId(businessId: string): Promise<TaskEntity[]> {
    const tasks = await this.taskModel
      .find({ businessId })
      .sort({ createdAt: -1 })
      .exec();
    return tasks.map((task) => this.toEntity(task));
  }

  async findByAssignedToUserId(userId: string): Promise<TaskEntity[]> {
    const tasks = await this.taskModel
      .find({ assignedToUserId: userId })
      .sort({ createdAt: -1 })
      .exec();
    return tasks.map((task) => this.toEntity(task));
  }

  async findByAssignedByUserId(userId: string): Promise<TaskEntity[]> {
    const tasks = await this.taskModel
      .find({ assignedByUserId: userId })
      .sort({ createdAt: -1 })
      .exec();
    return tasks.map((task) => this.toEntity(task));
  }

  async update(id: string, task: Partial<TaskEntity>): Promise<TaskEntity | null> {
    const updatedTask = await this.taskModel
      .findByIdAndUpdate(id, task, { new: true })
      .exec();
    return updatedTask ? this.toEntity(updatedTask) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.taskModel.findByIdAndDelete(id).exec();
    return !!result;
  }

  private toEntity(taskDoc: TaskDocument): TaskEntity {
    const task = new TaskEntity(
      taskDoc.title,
      taskDoc.description,
      taskDoc.businessId.toString(),
      taskDoc.assignedToUserId.toString(),
      taskDoc.assignedByUserId.toString(),
      taskDoc.images,
      taskDoc.status,
    );
    task.id = (taskDoc._id as Types.ObjectId).toString();
    task.createdAt = taskDoc.createdAt;
    task.updatedAt = taskDoc.updatedAt;
    return task;
  }
}
