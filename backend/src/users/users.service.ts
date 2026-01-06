import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { username, email, password, phone, ...rest } = createUserDto;
    const existingUser = await this.userRepository.findOne({
      where: [{ username: username }, { email: email }, { phone: phone }],
    });
    if (existingUser) {
      if (existingUser.username === username) {
        throw new HttpException('Username đã tồn tại', HttpStatus.BAD_REQUEST);
      }
      if (existingUser.email === email) {
        throw new HttpException('Email đã tồn tại', HttpStatus.BAD_REQUEST);
      }
      if (existingUser.phone === phone) {
        throw new HttpException(
          'Số điện thoại đã tồn tại',
          HttpStatus.BAD_REQUEST,
        );
      }
    }
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = this.userRepository.create({
      username,
      email,
      phone,
      password: hashedPassword,
      ...rest,
    });

    try {
      // Bước 4: Lưu xuống DB
      return await this.userRepository.save(newUser);
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi tạo người dùng');
    }
  }

  async findByUsernameOrEmailOrPhone(identifier: string) {
    return this.userRepository.findOne({
      where: [
        { username: identifier },
        { email: identifier },
        { phone: identifier },
      ],
      select: [
        'id',
        'username',
        'password',
        'email',
        'fullname',
        'phone',
        'image',
        'refreshToken',
      ],
    });
  }

  async findAll(): Promise<User[]> {
    const users = await this.userRepository.find();
    if (!users || users.length === 0) {
      throw new NotFoundException('No users found');
    }
    return users;
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async FindByUsername(username: string): Promise<User> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.username = :username', { username })
      .addSelect('user.password')
      .getOne();
    if (!user) {
      throw new NotFoundException(`User with username ${username} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: Partial<User>): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return await this.userRepository.remove(user);
  }
}
