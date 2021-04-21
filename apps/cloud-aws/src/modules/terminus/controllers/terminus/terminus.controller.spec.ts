import { Test, TestingModule } from '@nestjs/testing';
import { TerminusController } from './terminus.controller';

describe('TerminusController', () => {
  let controller: TerminusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TerminusController],
    }).compile();

    controller = module.get<TerminusController>(TerminusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
