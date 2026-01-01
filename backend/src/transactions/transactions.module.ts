import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from './entities/transaction.entity';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';

@Module({
  // Dòng này cực kỳ quan trọng:
  imports: [TypeOrmModule.forFeature([Transaction])], 
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}