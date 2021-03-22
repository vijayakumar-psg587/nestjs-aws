import { Test, TestingModule } from '@nestjs/testing';
import { FileStreamService } from './file-stream.service';

describe('FileStreamService', () => {
  let service: FileStreamService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FileStreamService],
    }).compile();

    service = module.get<FileStreamService>(FileStreamService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
