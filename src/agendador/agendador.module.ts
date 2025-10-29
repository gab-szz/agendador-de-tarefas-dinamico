// src/scheduler/scheduler.module.ts
import { Module } from '@nestjs/common';
import { AgendamentoService } from './agendador.service';
import { ConfiguracaoJobModule } from '../configurador-job/configuracao.module';
import { ColetorPrecoMoedaModule } from '../coletor-preco-moeda/coletor.module';

@Module({
  imports: [ConfiguracaoJobModule, ColetorPrecoMoedaModule],
  providers: [AgendamentoService],
  exports: [AgendamentoService],
})
export class AgendadorModule {}
