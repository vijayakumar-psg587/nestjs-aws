import { NestFactory } from '@nestjs/core';
import { CloudGcpModule } from './cloud-gcp.module';

async function bootstrap() {
  const app = await NestFactory.create(CloudGcpModule);
  await app.listen(3000);
}
bootstrap();
