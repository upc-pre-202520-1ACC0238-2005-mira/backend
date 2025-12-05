import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { TaskService } from '../application/task.service';
import { CreateTaskDto } from '../application/dto/create-task.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../shared/decorators/user.decorator';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createTask(
    @CurrentUser('sub') userId: string,
    @Body() createTaskDto: CreateTaskDto,
  ) {
    return this.taskService.createTask(createTaskDto, userId);
  }

  @Get('business/:businessId')
  async getTasksByBusiness(@Param('businessId') businessId: string) {
    return this.taskService.getTasksByBusiness(businessId);
  }

  @Get('assigned-to-me')
  async getTasksAssignedToMe(@CurrentUser('sub') userId: string) {
    return this.taskService.getTasksByAssignedTo(userId);
  }

  @Get('assigned-by-me')
  async getTasksAssignedByMe(@CurrentUser('sub') userId: string) {
    return this.taskService.getTasksByAssignedBy(userId);
  }

  @Put(':id/status')
  async updateTaskStatus(
    @Param('id') id: string,
    @Body('status') status: 'pending' | 'in_progress' | 'completed',
    @CurrentUser('sub') userId: string,
  ) {
    return this.taskService.updateTaskStatus(id, status, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteTask(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    await this.taskService.deleteTask(id, userId);
  }
}
