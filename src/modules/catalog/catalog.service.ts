import { Injectable } from '@nestjs/common';
import { getEntityManager } from '@typedorm/core';
import { Catalog } from 'src/entity';

@Injectable()
export class CatalogService {
  getAll(user_id: string) {
    const entityManger = getEntityManager();

    return entityManger.find(Catalog, {
      user_id,
    });
  }
}
