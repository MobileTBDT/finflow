import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { User } from '../../users/entities/user.entity';

@Entity('budgets')
export class Budget {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('decimal', { 
        precision: 12, 
        scale: 0, 
        default: 0,
        transformer: {
        to: (value: number) => value, // Khi lưu vào DB
        from: (value: string) => parseFloat(value) // Khi lấy ra từ DB
        } 
    })
    amount: number;

    @Column()
    period: string;

    @ManyToOne(() => Category, (category) => category.budgets)
    @JoinColumn({ name: 'category_id' })
    category: Category;

    @ManyToOne(() => User, (user) => user.budgets)
    @JoinColumn({ name: 'user_id' })
    user: User;
}