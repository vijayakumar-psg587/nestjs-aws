import { Test, TestingModule } from '@nestjs/testing';
import { CloudAwsController } from './cloud-aws.controller';
import { CloudAwsService } from './cloud-aws.service';

describe('CloudAwsController', () => {
  let cloudAwsController: CloudAwsController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CloudAwsController],
      providers: [CloudAwsService],
    }).compile();

    cloudAwsController = app.get<CloudAwsController>(CloudAwsController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(cloudAwsController.getHello()).toBe('Hello World!');
    });
  });
});
