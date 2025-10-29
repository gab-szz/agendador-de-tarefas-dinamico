// src/job-config/job-config.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfiguracaoJob } from './job-config.entity';
import { ConfiguracaoJobService } from './job-config.service';

@Module({
  imports: [TypeOrmModule.forFeature([ConfiguracaoJob])], // Importa a entidade
  providers: [ConfiguracaoJobService],
  exports: [ConfiguracaoJobService], // Exporta o serviço para outros módulos usarem
})
export class ConfiguracaoJobModule {}
