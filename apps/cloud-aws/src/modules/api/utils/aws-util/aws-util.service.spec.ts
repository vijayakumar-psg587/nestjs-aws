import { Test, TestingModule } from '@nestjs/testing';
import { AWSUtilService } from './aws-util.service';

describe('UtilService', () => {
  let service: AWSUtilService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AWSUtilService],
    }).compile();

    service = module.get<AWSUtilService>(AWSUtilService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
