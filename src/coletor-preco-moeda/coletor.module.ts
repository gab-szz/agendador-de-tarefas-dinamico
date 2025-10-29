// src/currency-collector/currency-collector.module.ts
import { Module } from '@nestjs/common';
import { ColetorPrecoMoedaService } from './coletor.service';
import { HttpModule } from '@nestjs/axios'; // Importe o HttpModule

@Module({
  imports: [
    HttpModule.register({
      // Configurações padrão do Axios (opcional)
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [ColetorPrecoMoedaService],
  exports: [ColetorPrecoMoedaService], // Vamos exportar para o Scheduler usar
})
export class ColetorPrecoMoedaModule {}
