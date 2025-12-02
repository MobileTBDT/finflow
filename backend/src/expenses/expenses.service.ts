import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

// Định nghĩa type cho 1 expense trong hệ thống
export interface Expense {
  id: number;
  amount: number;
  category: string;
  note?: string;
  spentAt: string;
}

@Injectable()
export class ExpensesService {
  // Mảng lưu tạm các expense (in-memory)
  private expenses: Expense[] = [];
  private idCounter = 1;

  // CREATE
  create(dto: CreateExpenseDto): Expense {
    const expense: Expense = {
      id: this.idCounter++,
      amount: dto.amount,
      category: dto.category,
      note: dto.note,
      spentAt: dto.spentAt,
    };

    this.expenses.push(expense);
    return expense;
  }

  // GET ALL
  findAll(): Expense[] {
    return this.expenses;
  }

  // GET ONE
  findOne(id: number): Expense {
    const expense = this.expenses.find((e) => e.id === id);
    if (!expense) {
      throw new NotFoundException('Expense not found');
    }
    return expense;
  }

  // UPDATE
  update(id: number, dto: UpdateExpenseDto): Expense {
    const index = this.expenses.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new NotFoundException('Expense not found');
    }

    const updated: Expense = {
      ...this.expenses[index],
      ...dto,
    };

    this.expenses[index] = updated;
    return updated;
  }

  // DELETE
  remove(id: number): Expense {
    const index = this.expenses.findIndex((e) => e.id === id);
    if (index === -1) {
      throw new NotFoundException('Expense not found');
    }

    const [deleted] = this.expenses.splice(index, 1);
    return deleted;
  }
}
