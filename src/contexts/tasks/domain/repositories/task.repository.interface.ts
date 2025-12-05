import { Task } from '../entities/task.entity';

export interface ITaskRepository {
  create(task: Task): Promise<Task>;
  findById(id: string): Promise<Task | null>;
  findByBusinessId(businessId: string): Promise<Task[]>;
  findByAssignedToUserId(userId: string): Promise<Task[]>;
  findByAssignedByUserId(userId: string): Promise<Task[]>;
  update(id: string, task: Partial<Task>): Promise<Task | null>;
  delete(id: string): Promise<boolean>;
}
