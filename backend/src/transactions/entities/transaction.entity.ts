import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { User } from '../../users/entities/user.entity'; // Giả sử bạn đã có User entity

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('decimal', { precision: 12, scale: 0, transformer: {
      to: (value: number) => value ? Math.round(value) : value,
      from: (value: string) => value ? parseInt(value) : null,} })
  amount: number;

  @Column({ type: 'date' })
  date: Date;

  @Column({ nullable: true })
  note: string;  

  @ManyToOne(() => Category, (category) => category.transactions)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => User, (user) => user.transactions)
  @JoinColumn({ name: 'user_id' })
  user: User;
}