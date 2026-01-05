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
import { TransactionType } from 'src/common/enums/transaction-type.enum';

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

  async addCategoryDefaultForUser(user: User) {
    const defaultCategories = [
      { name: "Total Income", type: TransactionType.INCOME },
      { name: "Total Expense", type: TransactionType.EXPENSE },
      { name: "Food", type: TransactionType.EXPENSE, icon: "https://img.icons8.com/?size=100&id=wqMCXXwVnkX2&format=png&color=000000" },
      { name: "Grocery", type: TransactionType.EXPENSE, icon: "https://img.icons8.com/?size=100&id=xQMqV2zd1bUf&format=png&color=000000" },
      { name: "Transportation", type: TransactionType.EXPENSE, icon: "https://img.icons8.com/?size=100&id=WX_XpoOd8F9G&format=png&color=000000" },
      { name: "Utilities", type: TransactionType.EXPENSE, icon: "https://img.icons8.com/?size=100&id=O3Mh96rncyzA&format=png&color=000000" },
      { name: "Rent", type: TransactionType.EXPENSE, icon: "https://img.icons8.com/?size=100&id=NyXo5zshezrT&format=png&color=000000" },
      { name: "Personal", type: TransactionType.EXPENSE, icon: "https://img.icons8.com/?size=100&id=TWWjobLHaAX3&format=png&color=000000" },
      { name: "Health", type: TransactionType.EXPENSE, icon: "https://img.icons8.com/?size=100&id=kaNUDQYjspwx&format=png&color=000000" },
      { name: "Sport", type: TransactionType.EXPENSE, icon: "https://img.icons8.com/?size=100&id=SMjRXXIK5MOb&format=png&color=000000" },
      { name: "Gift", type: TransactionType.EXPENSE, icon: "https://img.icons8.com/?size=100&id=Jle5eTAYFL4C&format=png&color=000000" },
      { name: "Saving", type: TransactionType.EXPENSE, icon: "https://img.icons8.com/?size=100&id=t4mDEwzCvgEr&format=png&color=000000" },
      { name: "Shopping", type: TransactionType.EXPENSE, icon: "https://img.icons8.com/?size=100&id=nOPXXjs3Jirr&format=png&color=000000" }
    ];
    await Promise.all(
        defaultCategories.map(category => this.create(category, user))
    );
  }
}
