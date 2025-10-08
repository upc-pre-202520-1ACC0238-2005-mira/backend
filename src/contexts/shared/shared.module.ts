import { Module } from '@nestjs/common';
import { ConfigModuleSetup } from './config/config.module';

@Module({
  imports: [ConfigModuleSetup],
  exports: [ConfigModuleSetup],
})
export class SharedModule {}
