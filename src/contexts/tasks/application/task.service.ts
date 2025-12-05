import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Task } from '../domain/entities/task.entity';
import { ITaskRepository } from '../domain/repositories/task.repository.interface';
import { CreateTaskDto } from './dto/create-task.dto';
import { IBusinessMemberRepository } from '../../business/domain/repositories/business-member.repository.interface';
import { IAppUserRepository } from '../../user-auth/domain/repositories/app-user.repository.interface';

@Injectable()
export class TaskService {
  constructor(
    @Inject('ITaskRepository')
    private readonly taskRepository: ITaskRepository,
    @Inject('IBusinessMemberRepository')
    private readonly businessMemberRepository: IBusinessMemberRepository,
    @Inject('IAppUserRepository')
    private readonly appUserRepository: IAppUserRepository,
  ) {}

  async createTask(
    createTaskDto: CreateTaskDto,
    assignedByUserId: string,
  ): Promise<Task> {
    // Verificar que el usuario asignado existe
    const assignedToUser = await this.appUserRepository.findById(
      createTaskDto.assignedToUserId,
    );
    if (!assignedToUser) {
      throw new NotFoundException('El usuario asignado no existe');
    }

    // Verificar que el usuario asignado pertenece al negocio
    const businessMembers = await this.businessMemberRepository.getUsersByBusinessId(
      createTaskDto.businessId,
    );
    const isMember = businessMembers.some(
      (member) => member.id === createTaskDto.assignedToUserId,
    );
    if (!isMember) {
      throw new BadRequestException(
        'El usuario asignado no pertenece a este negocio',
      );
    }

    // Verificar que el usuario que crea la tarea es admin
    const assignedByUser = await this.appUserRepository.findById(
      assignedByUserId,
    );
    if (!assignedByUser || assignedByUser.role !== 'admin') {
      throw new ForbiddenException(
        'Solo los administradores pueden crear tareas',
      );
    }

    const task = new Task(
      createTaskDto.title,
      createTaskDto.description,
      createTaskDto.businessId,
      createTaskDto.assignedToUserId,
      assignedByUserId,
      createTaskDto.images || [],
      createTaskDto.status || 'pending',
    );

    return this.taskRepository.create(task);
  }

  async getTasksByBusiness(businessId: string): Promise<Task[]> {
    return this.taskRepository.findByBusinessId(businessId);
  }

  async getTasksByAssignedTo(userId: string): Promise<Task[]> {
    return this.taskRepository.findByAssignedToUserId(userId);
  }

  async getTasksByAssignedBy(userId: string): Promise<Task[]> {
    return this.taskRepository.findByAssignedByUserId(userId);
  }

  async updateTaskStatus(
    taskId: string,
    status: 'pending' | 'in_progress' | 'completed',
    userId: string,
  ): Promise<Task> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    // Solo el usuario asignado o el admin que la creó puede cambiar el estado
    if (
      task.assignedToUserId !== userId &&
      task.assignedByUserId !== userId
    ) {
      const user = await this.appUserRepository.findById(userId);
      if (!user || user.role !== 'admin') {
        throw new ForbiddenException(
          'No tienes permiso para actualizar esta tarea',
        );
      }
    }

    const updatedTask = await this.taskRepository.update(taskId, { status });
    if (!updatedTask) {
      throw new NotFoundException('Error al actualizar la tarea');
    }

    return updatedTask;
  }

  async deleteTask(taskId: string, userId: string): Promise<void> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    // Solo el admin que creó la tarea puede eliminarla
    if (task.assignedByUserId !== userId) {
      const user = await this.appUserRepository.findById(userId);
      if (!user || user.role !== 'admin') {
        throw new ForbiddenException(
          'Solo el administrador que creó la tarea puede eliminarla',
        );
      }
    }

    const deleted = await this.taskRepository.delete(taskId);
    if (!deleted) {
      throw new NotFoundException('Error al eliminar la tarea');
    }
  }
}
