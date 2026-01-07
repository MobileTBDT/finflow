import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { TransactionType } from '../../common/enums/transaction-type.enum';

export class CreateCategoryDto {
  @IsNotEmpty({ message: 'Tên danh mục không được để trống' })
  @IsString({ message: 'Tên danh mục phải là một chuỗi ký tự' })
  name: string;

  @IsNotEmpty({ message: 'Loại giao dịch (Thu/Chi) không được để trống' })
  @IsEnum(TransactionType, { 
    message: 'Loại giao dịch không hợp lệ (Giá trị phải thuộc danh sách cho phép)' 
  })
  type: TransactionType;

  @IsOptional()
  @IsString()
  icon?: string;
}