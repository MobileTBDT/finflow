import { IsNotEmpty, IsNumber, IsPositive, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBudgetDto {
  @IsNotEmpty({ message: 'Số tiền ngân sách không được để trống' })
  @IsNumber({}, { message: 'Số tiền phải là dạng số' })
  @Min(0, { message: 'Số tiền không được là số âm' })
  amount: number;

  @IsNotEmpty({ message: 'Thời gian (kỳ hạn) không được để trống' })
  period: string;

  @IsNotEmpty({ message: 'Phải chọn danh mục (Category)' })
  @IsNumber({}, { message: 'Category ID phải là một số' })
  categoryId: number;
}