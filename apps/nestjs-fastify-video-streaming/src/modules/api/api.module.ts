import { forwardRef, Module } from '@nestjs/common';
import { StreamsModule } from './streams/streams.module';
import { AppModule } from '../../app.module';

@Module({
  imports: [forwardRef(() => AppModule), StreamsModule],
})
export class ApiModule {}
