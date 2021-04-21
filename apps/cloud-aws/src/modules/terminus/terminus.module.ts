import {HttpModule, Module} from '@nestjs/common';
import { TerminusController } from './controllers/terminus/terminus.controller';
import { TerminusService } from './service/terminus/terminus.service';

@Module({
  controllers: [TerminusController],
  providers: [TerminusService],
  imports: [HttpModule]
})
export class TerminusModule {}
