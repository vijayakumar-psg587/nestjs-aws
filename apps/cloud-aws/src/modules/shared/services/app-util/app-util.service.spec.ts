import { Test, TestingModule } from '@nestjs/testing';
import { AppUtilService } from './app-util.service';

describe('AppUtilService', () => {
  let service: AppUtilService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppUtilService],
    }).compile();

    service = module.get<AppUtilService>(AppUtilService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
