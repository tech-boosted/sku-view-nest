import { Controller, Get } from '@nestjs/common';
import { AuthUser } from 'src/helpers';
import { CatalogService } from './catalog.service';

@Controller('catalog')
export class CatalogController {
  constructor(private catalogService: CatalogService) {}

  @Get('/')
  async getCatalogs(@AuthUser() user_id) {
    return this.catalogService.getAll(user_id)?.then((res) => res?.items);
  }
}
