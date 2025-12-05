import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TaskController } from './interfaces/task.controller';
import { TaskService } from './application/task.service';
import { TaskRepository } from './infrastructure/persistence/task.repository';
import { Task, TaskSchema } from './infrastructure/schemas/task.schema';
import { BusinessModule } from '../business/business.module';
import { UserAuthModule } from '../user-auth/user-auth.module';
import { SharedModule } from '../shared/shared.module';

@Module({
  imports: [
    SharedModule,
    forwardRef(() => BusinessModule),
    UserAuthModule,
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }]),
  ],
  controllers: [TaskController],
  providers: [
    TaskService,
    {
      provide: 'ITaskRepository',
      useClass: TaskRepository,
    },
  ],
  exports: [TaskService, 'ITaskRepository'],
})
export class TasksModule {}
