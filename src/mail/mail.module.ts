import { DynamicModule, Module } from '@nestjs/common';
import { MailService } from './mail.service';

@Module({
  providers: [MailService],
  exports: [MailService]
})
export class MailModule {}
