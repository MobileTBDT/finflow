import { 
  Injectable, 
  NotFoundException, 
  ConflictException, 
  InternalServerErrorException,
  ForbiddenException,
  BadRequestException
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { Budget } from './entities/budget.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
  ) {}

  async create(createBudgetDto: CreateBudgetDto, user: User) {
    const existingBudget = await this.budgetRepository.findOne({
      where: {
        user: { id: user.id },
        category: { id: createBudgetDto.categoryId },
        period: createBudgetDto.period 
      }
    });

    if (existingBudget) {
      throw new ConflictException('Ngân sách cho danh mục này trong tháng đã tồn tại');
    }

    const newBudget = this.budgetRepository.create({
      ...createBudgetDto,
      user: user, 
      category: { id: createBudgetDto.categoryId } 
    });

    try {
      return await this.budgetRepository.save(newBudget);
    } catch (error) {
      throw new InternalServerErrorException('Lỗi khi tạo ngân sách');
    }
  }

  // --- 2. LẤY DANH SÁCH (Hỗ trợ lọc theo Category) ---
  async findAll(userId: number, categoryId?: number) {
    // Tạo query cơ bản
    const queryOptions: any = {
      where: { user: { id: userId } },
      relations: ['category'],
      order: { period: 'DESC' } 
    };

    if (categoryId) {
      queryOptions.where.category = { id: categoryId };
    }

    return await this.budgetRepository.find(queryOptions);
  }

  // --- 3. LẤY BUDGET GẦN NHẤT CỦA 1 CATEGORY ---
  async findLatest(userId: number, categoryId: number) {
    const budget = await this.budgetRepository.findOne({
      where: { 
        user: { id: userId }, 
        category: { id: categoryId } 
      },
      relations: ['category'],
      order: { period: 'DESC' }, // Sắp xếp giảm dần theo ngày
    });

    return budget;
  }

  // --- 4. LẤY CHI TIẾT 1 BUDGET (Theo ID) ---
  async findOne(id: number, userId: number) {
    const budget = await this.budgetRepository.findOne({
      where: { id, user: { id: userId } }, // Check userId để bảo mật
      relations: ['category']
    });

    if (!budget) {
      throw new NotFoundException(`Không tìm thấy ngân sách #${id}`);
    }

    return budget;
  }

  // --- 5. CẬP NHẬT (Theo ID) ---
  async update(id: number, updateBudgetDto: UpdateBudgetDto, userId: number) {
    const budget = await this.findOne(id, userId);

    const { categoryId, ...updateData } = updateBudgetDto;

    Object.assign(budget, updateData);

    if (categoryId) {
      budget.category = { id: categoryId } as any;
    }

    return await this.budgetRepository.save(budget);
  }

  async remove(id: number, userId: number) {
    const budget = await this.findOne(id, userId);
    return await this.budgetRepository.remove(budget);
  }
}