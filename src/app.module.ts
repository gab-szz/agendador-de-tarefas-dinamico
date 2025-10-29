// src/app.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfiguracaoJobModule } from './job-config/job-config.module';
import { ConfiguracaoJob } from './job-config/job-config.entity';
import { CurrencyCollectorModule } from './currency-collector/currency-collector.module';
import { HttpModule } from '@nestjs/axios';
import { SchedulerModule } from './scheduler/scheduler.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      entities: [ConfiguracaoJob],
      synchronize: true,
    }),
    HttpModule,
    ConfiguracaoJobModule,
    CurrencyCollectorModule,
    SchedulerModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
