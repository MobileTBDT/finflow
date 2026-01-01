import {   
  Injectable, 
  NotFoundException, 
  ConflictException, 
  InternalServerErrorException, 
  HttpException, 
  HttpStatus } from '@nestjs/common';
import { CreateBudgetDto } from './dto/create-budget.dto';
import { UpdateBudgetDto } from './dto/update-budget.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Budget } from './entities/budget.entity';

@Injectable()
export class BudgetsService {
  constructor(
    @InjectRepository(Budget)
    private budgetRepository: Repository<Budget>,
  ) {}
  create(createBudgetDto: CreateBudgetDto) {
    return 'This action adds a new budget';
  }

  findAll() {
    return `This action returns all budgets`;
  }

  findOne(id: number) {
    return `This action returns a #${id} budget`;
  }

  update(id: number, updateBudgetDto: UpdateBudgetDto) {
    return `This action updates a #${id} budget`;
  }

  remove(id: number) {
    return `This action removes a #${id} budget`;
  }
}
