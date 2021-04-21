import { Test, TestingModule } from '@nestjs/testing';
import { CloudGcpController } from './cloud-gcp.controller';
import { CloudGcpService } from './cloud-gcp.service';

describe('CloudGcpController', () => {
  let cloudGcpController: CloudGcpController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CloudGcpController],
      providers: [CloudGcpService],
    }).compile();

    cloudGcpController = app.get<CloudGcpController>(CloudGcpController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(cloudGcpController.getHello()).toBe('Hello World!');
    });
  });
});
