import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import { SocialService } from '../application/social.service';
import { CreatePostDto } from '../application/dto/create-post.dto';
import { UpdatePostDto } from '../application/dto/update-post.dto';

@Controller('social')
export class SocialController {
  constructor(private readonly socialService: SocialService) {}

  @Get()
  async findAll(@Query('autor') autor?: string) {
    if (autor) {
      return this.socialService.findByAutor(autor);
    }
    return this.socialService.findAll();
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.socialService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPostDto: CreatePostDto) {
    return this.socialService.create(createPostDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.socialService.update(id, updatePostDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string) {
    return this.socialService.delete(id);
  }

  @Patch(':id/like')
  async likePost(@Param('id') id: string) {
    return this.socialService.likePost(id);
  }
}
