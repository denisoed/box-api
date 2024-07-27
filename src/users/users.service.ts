import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto) {
    return this.usersRepository.save(createUserDto);
  }

  findAll({ sort, limit }) {
    return this.usersRepository.find({
      order: {
        [sort.property]: sort.direction,
      },
      take: limit,
    });
  }

  findOne(telegramId: number) {
    return this.usersRepository.findOneBy({ telegramId });
  }

  update(telegramId: number, updateUserDto: UpdateUserDto) {
    return this.usersRepository.update(telegramId, updateUserDto);
  }

  remove(telegramId: number) {
    return this.usersRepository.delete({ telegramId });
  }
}
