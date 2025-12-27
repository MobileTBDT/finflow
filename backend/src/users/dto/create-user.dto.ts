import { 
  IsString, 
  IsNotEmpty, 
  MinLength, 
  MaxLength, 
  IsEmail, 
  IsOptional, 
  IsDate, 
  IsPhoneNumber,
  IsUrl,
  Matches
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Username không được để trống' })
  @IsString()
  @MinLength(4, { message: 'Username phải có ít nhất 4 ký tự' })
  @MaxLength(20, { message: 'Username không được quá 20 ký tự' })
  username: string;

  @IsNotEmpty({ message: 'Password không được để trống' })
  @IsString()
  @MinLength(6, { message: 'Password phải có ít nhất 6 ký tự' })
  password: string;

  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @IsString()
  fullname: string;

  @IsNotEmpty({ message: 'Email không được để trống' })
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email: string;

  @IsOptional()
  @Type(() => Date) // Chuyển đổi chuỗi JSON sang đối tượng Date
  @IsDate({ message: 'Ngày sinh phải là định dạng ngày tháng hợp lệ' })
  dateofbirth?: Date;

  @IsOptional()
  @IsString()
  @Matches(/^[0-9]*$/, { message: 'Số điện thoại chỉ được chứa số' })
  @MaxLength(20, { message: 'Số điện thoại không được quá 20 ký tự' })
  phone?: string;

  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Ảnh đại diện phải là một đường dẫn URL hợp lệ' })
  image?: string;
}