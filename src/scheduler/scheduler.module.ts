// src/scheduler/scheduler.module.ts
import { Module } from '@nestjs/common';
import { AgendamentoService } from './scheduler.service';
import { ConfiguracaoJobModule } from '../job-config/job-config.module';
import { CurrencyCollectorModule } from '../currency-collector/currency-collector.module';

@Module({
  imports: [ConfiguracaoJobModule, CurrencyCollectorModule],
  providers: [AgendamentoService],
  exports: [AgendamentoService],
})
export class SchedulerModule {}
