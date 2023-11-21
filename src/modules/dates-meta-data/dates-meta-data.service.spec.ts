import { Test, TestingModule } from '@nestjs/testing';
import { DatesMetaDataService } from './dates-meta-data.service';

describe('DatesMetaDataService', () => {
  let service: DatesMetaDataService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatesMetaDataService],
    }).compile();

    service = module.get<DatesMetaDataService>(DatesMetaDataService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
