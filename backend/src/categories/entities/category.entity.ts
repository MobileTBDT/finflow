import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { TransactionType } from '../../common/enums/transaction-type.enum';
import { User } from 'src/users/entities/user.entity';
import { Budget } from '../../budgets/entities/budget.entity'

@Entity('categories')
export class Category {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({
    type: 'enum',
    enum: TransactionType,
    default: TransactionType.EXPENSE
    })
    type: TransactionType; // xác định đây là khoản Thu hay Chi

    @Column({ nullable: true })
    icon: string; // Tên icon hoặc URL

    @OneToMany(() => Transaction, (transaction) => transaction.category)
    transactions: Transaction[];

    @OneToMany(() => Budget, (budget) => budget.category)
    budgets: Budget[];

    @ManyToOne(() => User, (user) => user.categories)
    @JoinColumn({ name: 'user_id' })
    user: User;
}