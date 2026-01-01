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
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}
  async create(createCategoryDto: CreateCategoryDto) {
    return await this.categoryRepository.save(createCategoryDto);
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

  async findAll() {
    try {
      const categories = await this.categoryRepository.find();
      if (!categories || categories.length === 0) {
        throw new NotFoundException('Categories not found');
      }
      return categories;
    }
    catch (error) {
      throw new InternalServerErrorException('Failed to fetch categories');
    }
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`)
    }
    Object.assign(category, updateCategoryDto);
    return await this.categoryRepository.save(category);
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return await this.categoryRepository.remove(category);
  }
}
