import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionsModule } from './transactions/transactions.module';
import { CategoriesModule } from './categories/categories.module';
import { BudgetsModule } from './budgets/budgets.module';
import { Budget } from './budgets/entities/budget.entity';
import { User } from './users/entities/user.entity';
import { Category } from './categories/entities/category.entity';
import { Transaction } from './transactions/entities/transaction.entity';

@Module({
  imports: [
    UsersModule,  
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'Tung2303',
      database: 'Finflow',
      autoLoadEntities: true,
      entities: [User, Budget, Category, Transaction],
      synchronize: true, // ❗ chỉ dùng khi dev
    }),
    TransactionsModule,
    CategoriesModule,
    BudgetsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
