import { ApiProperty } from '@nestjs/swagger';

export class CreateExpenseDto {
  @ApiProperty({ example: 120000, description: 'Số tiền đã chi' })
  amount: number;

  @ApiProperty({ example: 'Food', description: 'Danh mục chi tiêu' })
  category: string;

  @ApiProperty({ example: 'Ăn sáng bún bò', required: false })
  note?: string;

  @ApiProperty({
    example: '2025-12-02',
    description: 'Ngày chi tiêu dạng YYYY-MM-DD',
  })
  spentAt: string;
}
