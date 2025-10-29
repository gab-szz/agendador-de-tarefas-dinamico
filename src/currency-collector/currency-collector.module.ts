// src/currency-collector/currency-collector.module.ts
import { Module } from '@nestjs/common';
import { CurrencyCollectorService } from './currency-collector.service';
import { HttpModule } from '@nestjs/axios'; // Importe o HttpModule

@Module({
  imports: [
    HttpModule.register({
      // Configurações padrão do Axios (opcional)
      timeout: 5000,
      maxRedirects: 5,
    }),
  ],
  providers: [CurrencyCollectorService],
  exports: [CurrencyCollectorService], // Vamos exportar para o Scheduler usar
})
export class CurrencyCollectorModule {}
