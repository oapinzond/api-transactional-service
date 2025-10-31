import { Test, TestingModule } from '@nestjs/testing';

import { RechargesController } from './recharges.controller';

describe('RechargesController', () => {
  let controller: RechargesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RechargesController]
    }).compile();

    controller = module.get<RechargesController>(RechargesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
