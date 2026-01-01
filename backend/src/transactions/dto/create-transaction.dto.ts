import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTransactionDto {
  @IsNotEmpty({ message: 'Số tiền không được để trống' })
  @IsNumber({}, { message: 'Số tiền phải là dạng số' })

  @Min(0, { message: 'Số tiền không được nhỏ hơn 0' })
  amount: number;

  @IsNotEmpty({ message: 'Ngày giao dịch không được để trống' })
  @Type(() => Date) // Chuyển đổi chuỗi JSON (vd: "2023-12-20") thành Date object
  @IsDate({ message: 'Định dạng ngày tháng không hợp lệ' })
  date: Date;

  @IsOptional()
  @IsString({ message: 'Ghi chú phải là dạng chuỗi' })
  note?: string;

  @IsNotEmpty({ message: 'Phải chọn danh mục giao dịch' })
  @IsNumber({}, { message: 'Category ID phải là một số' })
  categoryId: number;
}