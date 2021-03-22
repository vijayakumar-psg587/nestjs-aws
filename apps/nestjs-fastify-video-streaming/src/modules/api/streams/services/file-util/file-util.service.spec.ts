import { Test, TestingModule } from '@nestjs/testing';
import { FileUtilService } from './file-util.service';

describe('FileUtilService', () => {
  let service: FileUtilService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileUtilService],
    }).compile();

    service = module.get<FileUtilService>(FileUtilService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
