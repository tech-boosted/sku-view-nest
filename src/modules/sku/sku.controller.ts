import { Body, Controller, Get, Post } from '@nestjs/common';
import { SkuService } from './sku.service';

@Controller('sku')
export class SkuController {
  constructor(private skuService: SkuService) {}

  @Post()
  async create() {
    return this.skuService.create(
      '54c739e2-a276-4aec-a92e-75e05a8995ab',
      'amazon_us',
    );
  }

  @Get()
  async findOne(
    @Body() findByDateDTO: { start_date: string; end_date: string },
  ) {
    return this.skuService.findByDate(
      findByDateDTO.start_date,
      findByDateDTO.end_date,
    );
  }
}
