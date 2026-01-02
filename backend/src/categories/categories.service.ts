import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  InternalServerErrorException, 
  HttpException, 
  HttpStatus
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Repository, IsNull } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}
  async create(createCategoryDto: CreateCategoryDto, user: User) {
    const category = this.categoryRepository.create({
      ...createCategoryDto,
      user: user
    });
    return await this.categoryRepository.save(category);
  }

  async findByUser(user_id: number) {
    try {
      const categories = await this.categoryRepository.find( { where: { user: { id: user_id }}});
      if (!categories || categories.length === 0) {
        throw new NotFoundException('Categories not found')
      }
      return categories;
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch categories');
    }
  }

  async findAll(userId: number) {
    try {
      const categories = await this.categoryRepository.find({ where: { user: { id: userId } } });
      if (!categories || categories.length === 0) {
        throw new NotFoundException('Categories not found');
      }
      return categories;
    }
    catch (error) {
      throw new InternalServerErrorException('Failed to fetch categories');
    }
  }

  async findOne(id: number, userId?: number) { // userId nên bắt buộc ở đây
    const category = await this.categoryRepository.findOne({
      where: [
        { id, user: { id: userId } }, 
        { id, user: IsNull() }        
      ],
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto, userId: number) {
    const category = await this.findOne(id, userId);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`)
    }
    Object.assign(category, updateCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async remove(id: number, userId: number) {
    const category = await this.findOne(id, userId);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return await this.categoryRepository.remove(category);
  }
}
