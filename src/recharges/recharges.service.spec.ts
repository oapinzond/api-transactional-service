import { Test, TestingModule } from '@nestjs/testing';
import { RechargesService } from './recharges.service';

describe('RechargesService', () => {
  let service: RechargesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RechargesService],
    }).compile();

    service = module.get<RechargesService>(RechargesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
