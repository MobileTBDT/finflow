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
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

const toBool = (v: unknown) =>
  String(v ?? '')
    .trim()
    .toLowerCase() === 'true';
const toStr = (v: unknown) => String(v ?? '').trim();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Init DB connection FIRST
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql',
        host: toStr(configService.get('DB_HOST')),
        port: Number(toStr(configService.get('DB_PORT')) || 3306),
        username: toStr(configService.get('DB_USERNAME')),
        password: toStr(configService.get('DB_PASSWORD')),
        database: toStr(configService.get('DB_NAME')),

        autoLoadEntities: true,
        entities: [User, Budget, Category, Transaction],

        synchronize: toBool(configService.get('DB_SYNCHRONIZE')),

        logging: toBool(configService.get('DB_LOGGING'))
          ? ['schema', 'error']
          : ['error'],
      }),
    }),

    UsersModule,
    TransactionsModule,
    CategoriesModule,
    BudgetsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
