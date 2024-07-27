import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { GetUserDto } from './dto/get-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { getUserProfilePhoto } from '../helpers/telegram';
import {
  SortingParams,
  SortingParam,
} from '../decorators/sorting-params.decorator';
import { ApiSortingQuery } from '../decorators/sorting-params-swagger.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const userPic = await getUserProfilePhoto(createUserDto.telegramId);
      const data = await this.usersService.create({
        ...createUserDto,
        userPic,
      });
      return { success: true, error: null, data };
    } catch (error) {
      return { success: false, error: error.message, data: null };
    }
  }

  @ApiSortingQuery(['score'])
  @Get()
  async findAll(
    @SortingParams(['score'])
    sort?: SortingParam,
    @Query('limit') limit?: number,
  ) {
    const data = await this.usersService.findAll(sort, limit);
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
