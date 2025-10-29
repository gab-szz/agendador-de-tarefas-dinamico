// src/currency-collector/currency-collector.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface DadosAPI {
  USDBRL: {
    code: string;
    codein: string;
    name: string;
    high: string;
    low: string;
    bid: string;
    ask: string;
    timestamp: string;
    create_date: string;
  };
}

@Injectable()
export class ColetorPrecoMoedaService {
  private readonly logger = new Logger(ColetorPrecoMoedaService.name);

  private readonly apiUrl = 'https://economia.awesomeapi.com.br/last/USD-BRL';

  constructor(private readonly httpService: HttpService) {}

  async coletarInformacoes(): Promise<void> {
    this.logger.log('Iniciando coleta de dados de câmbio (USD-BRL)...');
    try {
      // O httpService.get() retorna um Observable, usamos firstValueFrom para convertê-lo em Promise
      const response = await firstValueFrom(
        this.httpService.get<DadosAPI>(this.apiUrl),
      );

      // Usamos parseFloat para garantir que a 'rate' seja numérica se for salvar.
      const rate = parseFloat(response.data?.USDBRL?.bid);

      if (rate) {
        this.logger.log(`[SUCESSO] Cotação atual USD-BRL: R$ ${rate}`);
      } else {
        this.logger.warn(
          '[AVISO] Resposta da API não continha a cotação esperada.',
        );
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      this.logger.error('Falha ao coletar dados de câmbio', error.stack);
    }
  }
}
