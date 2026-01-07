import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { Transaction } from './entities/transaction.entity';
import { User } from '../users/entities/user.entity';
import { TransactionType } from '../common/enums/transaction-type.enum'
@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  // --- 1. TẠO GIAO DỊCH (THÊM INCOME HOẶC EXPENSE) ---
  async create(createTransactionDto: CreateTransactionDto, user: User) {
    const newTransaction = this.transactionRepository.create({
      ...createTransactionDto,
      user: user, // Gắn user hiện tại vào
      category: { id: createTransactionDto.categoryId } // Map ID sang object Category
    });

    return await this.transactionRepository.save(newTransaction);
  }

  // --- 2. LẤY TRANSACTION THEO LOẠI (INCOME/EXPENSE) TRONG THÁNG HIỆN TẠI ---
  async findAllByTypeCurrentMonth(userId: number, type: 'INCOME' | 'EXPENSE') {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Trả về "01", "02", ...
    
    const startOfMonth = `${year}-${month}-01`;
    
    const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
    const endOfMonth = `${year}-${month}-${lastDay}`;

    return await this.transactionRepository.find({
      where: {
        user: { id: userId },
        category: { type: TransactionType.EXPENSE },
        date: Between(startOfMonth, endOfMonth) 
      },
      relations: ['category'], 
      order: { date: 'DESC' }
    });
  }

  // --- 3. BÁO CÁO CHI TIÊU (EXPENSE) TỪNG NGÀY TRONG TUẦN HIỆN TẠI ---
  async getWeeklyExpenseDaily(userId: number) {
    const now = new Date();
    const dayOfWeek = now.getDay(); 
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); 
    
    const monday = new Date(now.setDate(diff));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    const startStr = formatDate(monday);
    const endStr = formatDate(sunday);

    const transactions = await this.transactionRepository.find({
      where: {
        user: { id: userId },
        category: { type: TransactionType.EXPENSE },
        date: Between(startStr, endStr)
      }
    });

    const result: { date: string; dayName: string; total: number }[] = [];

    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(monday);
      currentDay.setDate(monday.getDate() + i);
      const dateString = formatDate(currentDay);

      const totalAmount = transactions
        .filter(t => t.date === dateString)
        .reduce((sum, t) => sum + Number(t.amount), 0);

      result.push({
        date: dateString,
        dayName: this.getDayName(i),
        total: totalAmount
      });
    }

    return result;
  }

  // --- 4. BÁO CÁO CHI TIÊU (EXPENSE) THEO CATEGORY TRONG THÁNG ---
  async getMonthlyExpenseByCategory(userId: number) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  const startStr = `${year}-${month}-01`;
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  const endStr = `${year}-${month}-${lastDay}`;

  const transactions = await this.transactionRepository.find({
    where: {
      user: { id: userId },
      category: { type: TransactionType.EXPENSE },
      date: Between(startStr, endStr)
    },
    relations: ['category']
  });

  const categoryMap = new Map<number, any>();

  transactions.forEach(t => {
    const catId = t.category.id;
    if (!categoryMap.has(catId)) {
      categoryMap.set(catId, {
        categoryId: catId,
        categoryName: t.category.name,
        categoryIcon: t.category.icon,
        totalAmount: 0
      });
    }
    categoryMap.get(catId).totalAmount += Number(t.amount);
  });

  return Array.from(categoryMap.values()).sort((a, b) => b.totalAmount - a.totalAmount);
}

  // --- 5. CẬP NHẬT TRANSACTION ---
  async update(id: number, updateTransactionDto: UpdateTransactionDto, userId: number) {
    const transaction = await this.findOne(id, userId); // Check quyền sở hữu
    
    const { categoryId, ...updateData } = updateTransactionDto;

    Object.assign(transaction, updateData);

    if (categoryId) {
      transaction.category = { id: categoryId } as any;
    }

    return await this.transactionRepository.save(transaction);
  }

  // --- 6. XÓA TRANSACTION ---
  async remove(id: number, userId: number) {
    const transaction = await this.findOne(id, userId); // Check quyền sở hữu
    return await this.transactionRepository.remove(transaction);
  }

  // --- HÀM PHỤ: LẤY CHI TIẾT 1 GIAO DỊCH ---
  async findOne(id: number, userId: number) {
    const transaction = await this.transactionRepository.findOne({
      where: { id, user: { id: userId } },
      relations: ['category']
    });

    if (!transaction) {
      throw new NotFoundException('Giao dịch không tồn tại');
    }
    return transaction;
  }

  async findAll(userId: number) {
    return await this.transactionRepository.find({
      where: { user: { id: userId } },
      relations: ['category']
    });
  }


  // Helper: Lấy tên thứ
  private getDayName(index: number): string {
    const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
    return days[index];
  }
}