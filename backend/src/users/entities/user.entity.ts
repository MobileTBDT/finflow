import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { Category } from '../../categories/entities/category.entity';
import { Budget } from '../../budgets/entities/budget.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

 @Column({ unique: true }) 
  username: string;

  @Column({ select: false }) 
  password: string;

  @Column({ name: 'full_name' }) 
  fullname: string;

  @Column({ type: 'date', name: 'date_of_birth', nullable: true }) 
  dateofbirth: Date;

  @Column({ length: 20, nullable: true, unique: true }) 
  phone: string;

  @Column({ unique: true }) 
  email: string;

  @Column({ nullable: true }) 
  image: string;

  @Column({ nullable: true })
  refreshToken: string;

  @CreateDateColumn({ name: 'created_at' }) 
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' }) 
  updatedAt: Date;

  @OneToMany(() => Transaction, (transaction) => transaction.user)
  transactions: Transaction[];

  @OneToMany(() => Category, (category) => category.user)
  categories: Category[];

  @OneToMany(() => Budget, (budget) => budget.user)
  budgets: Budget[];
}