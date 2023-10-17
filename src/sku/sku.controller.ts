import { Body, Controller, Get, Post } from '@nestjs/common';
import { SkuService } from './sku.service';

@Controller('sku')
export class SkuController {
  constructor(private skuService: SkuService) {}

  @Post()
  async create(@Body() createSkuDTO: any) {
    return this.skuService.create(
      createSkuDTO,
      'shahbaz@boosted.in',
      'amazon_us',
    );
  }

  @Get('sku')
  async findOne(@Body() findByDateDTO: { date: string }) {
    return this.skuService.findByDate(findByDateDTO.date);
  }
}
