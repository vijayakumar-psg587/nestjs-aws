import { Module, forwardRef } from '@nestjs/common';
import { CoreModule } from './modules/core/core.module';
import { SharedModule } from './modules/shared/shared.module';
import { ApiModule } from './modules/api/api.module';
import { TerminusModule } from './modules/terminus/terminus.module';
import { App } from './main';

@Module({
  imports: [CoreModule, SharedModule, forwardRef(() => ApiModule), TerminusModule],
  providers: [{ provide: 'FastifyNestjsApp', useValue: App }],
  controllers: [],
})
export class AppModule {}
