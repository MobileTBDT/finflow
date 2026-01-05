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
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); 
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

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
    
    const startOfWeek = new Date(now.setDate(diff));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    // Lấy tất cả expense trong tuần
    const transactions = await this.transactionRepository.find({
      where: {
        user: { id: userId },
        category: { type: TransactionType.EXPENSE },
        date: Between(startOfWeek, endOfWeek)
      }
    });

    const result: { date: string; dayName: string; total: number }[] = []
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);
      const dateString = currentDay.toISOString().split('T')[0]; // YYYY-MM-DD

      // Tính tổng tiền của ngày đó
      const totalAmount = transactions
        .filter(t => {
            // So sánh ngày (do transaction.date có thể là Date object hoặc string tùy config DB)
            const tDate = new Date(t.date).toISOString().split('T')[0];
            return tDate === dateString;
        })
        .reduce((sum, t) => sum + Number(t.amount), 0);

      result.push({
        date: dateString,
        dayName: this.getDayName(i), // Hàm phụ lấy tên thứ
        total: totalAmount
      });
    }

    return result;
  }

  // --- 4. BÁO CÁO CHI TIÊU (EXPENSE) THEO CATEGORY TRONG THÁNG ---
  async getMonthlyExpenseByCategory(userId: number) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Lấy danh sách expense tháng này kèm thông tin category
    const transactions = await this.transactionRepository.find({
      where: {
        user: { id: userId },
        category: { type: TransactionType.EXPENSE },
        date: Between(startOfMonth, endOfMonth)
      },
      relations: ['category']
    });

    // Gom nhóm tính tổng theo từng Category
    const categoryMap = new Map<number, any>();

    transactions.forEach(t => {
      const catId = t.category.id;
      if (!categoryMap.has(catId)) {
        categoryMap.set(catId, {
          categoryId: catId,
          categoryName: t.category.name, // Giả sử category có name
          // categoryIcon: t.category.image, // Nếu có
          totalAmount: 0
        });
      }
      const current = categoryMap.get(catId);
      current.totalAmount += Number(t.amount);
    });

    // Chuyển Map thành Array để trả về Client
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

  // Helper: Lấy tên thứ
  private getDayName(index: number): string {
    const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ Nhật'];
    return days[index];
  }
}