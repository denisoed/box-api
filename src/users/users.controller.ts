import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const data = await this.usersService.create(createUserDto);
      return { success: true, error: null, data };
    } catch (error) {
      return { success: false, error: error.message, data: null };
    }
  }

  @Get()
  async findAll() {
    const data = await this.usersService.findAll();
    return { success: true, error: null, data };
  }

  @Get(':telegramId')
  async findOne(@Param('telegramId') telegramId: string) {
    try {
      const data = await this.usersService.findOne(+telegramId);
      if (!data) {
        return {
          success: false,
          error: 'User not found',
          data: null,
        };
      }
      return { success: true, error: null, data };
    } catch (error) {
      return { success: false, error: error.message, data: null };
    }
  }

  @Patch(':telegramId')
  async update(
    @Param('telegramId') telegramId: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      const data = await this.usersService.update(+telegramId, updateUserDto);
      return { success: true, error: null, data };
    } catch (error) {
      return { success: false, error: error.message, data: null };
    }
  }

  @Delete(':telegramId')
  remove(@Param('telegramId') telegramId: string) {
    return this.usersService.remove(+telegramId);
  }
}
