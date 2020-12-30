import { HttpModule, Module } from '@nestjs/common';
import { TerminusService } from './services/terminus/terminus.service';
import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';
import { TerminusController } from './controllers/terminus.controller';
import { HttpConfigService } from '../shared/services/http-config/http-config.service';

@Module({
  providers: [TerminusService],
  controllers: [TerminusController],
  imports: [
    CoreModule,
    SharedModule,
    HttpModule.registerAsync({
      useClass: HttpConfigService,
    }),
  ],
})
export class TerminusModule {}
