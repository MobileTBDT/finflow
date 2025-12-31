import { IsNotEmpty, IsNumber, IsPositive, IsDate, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBudgetDto {
  @IsNotEmpty({ message: 'Số tiền ngân sách không được để trống' })
  @IsNumber({}, { message: 'Số tiền phải là dạng số' })
  @Min(0, { message: 'Số tiền không được là số âm' })
  amount: number;

  @IsNotEmpty({ message: 'Thời gian (kỳ hạn) không được để trống' })
  @Type(() => Date) // Tự động chuyển chuỗi (vd: "2023-10-01") thành object Date
  @IsDate({ message: 'Định dạng ngày tháng không hợp lệ' })
  period: Date;

  @IsNotEmpty({ message: 'Phải chọn danh mục (Category)' })
  @IsNumber({}, { message: 'Category ID phải là một số' })
  categoryId: number;

  // Lưu ý về User:
  // Thông thường User ID sẽ được lấy từ Token (JWT) của người đang đăng nhập
  // nên không cần truyền trong DTO.
  // Tuy nhiên, nếu bạn muốn truyền thủ công User ID từ Body, hãy bỏ comment dòng dưới:
  
  // @IsNotEmpty()
  // @IsNumber()
  // userId: number;
}