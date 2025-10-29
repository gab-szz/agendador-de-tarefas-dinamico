// src/scheduler/scheduler.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfiguracaoJobService } from '../job-config/job-config.service';
import { CurrencyCollectorService } from '../currency-collector/currency-collector.service';
import { ConfiguracaoJob } from '../job-config/job-config.entity';

@Injectable()
export class AgendamentoService implements OnModuleInit {
  private readonly logger = new Logger(AgendamentoService.name);

  private jobTimeouts = new Map<string, NodeJS.Timeout>();

  constructor(
    private readonly ConfiguracaoJobService: ConfiguracaoJobService,
    private readonly currencyCollectorService: CurrencyCollectorService,
  ) {}

  async onModuleInit() {
    this.logger.log('Iniciando AgendamentoService...');
    this.logger.log('Carregando jobs do banco de dados...');

    const jobs = await this.ConfiguracaoJobService.buscarTodosJobs();

    if (jobs.length === 0) {
      this.logger.warn('Nenhum job encontrado para agendar.');
      return;
    }

    this.logger.log(`Encontrados ${jobs.length} job(s). Agendando...`);

    jobs.forEach((job) => {
      this.agendarJob(job);
    });
  }

  /**
   * Configura o loop de setTimeout recursivo para um job específico.
   */
  private agendarJob(job: ConfiguracaoJob) {
    const nomeJob = job.job_name;
    const intervalo = job.interval_seconds * 1000;

    this.logger.log(
      `Agendando job [${nomeJob}] para rodar a cada ${job.interval_seconds}s.`,
    );

    // --- Esta é a função que roda a cada "tick" ---
    const rodarJob = async () => {
      this.logger.log(`TICK: [${nomeJob}]`);
      let lockAdquirido = false;

      try {
        lockAdquirido =
          await this.ConfiguracaoJobService.tentarBloquearJob(nomeJob);

        if (lockAdquirido) {
          this.logger.log(`[${nomeJob}] Lock adquirido. INICIANDO execução...`);

          // Aqui é onde o "roteador" de jobs entra.
          if (nomeJob === 'currency-collector') {
            await this.currencyCollectorService.collectAndLog();
          } else {
            this.logger.warn(`[${nomeJob}] Executor não implementado.`);
          }

          this.logger.log(`[${nomeJob}] Execução FINALIZADA.`);
        } else {
          this.logger.log(`[${nomeJob}] Pulado (lock não adquirido).`);
        }
      } catch (error) {
        this.logger.error(`[${nomeJob}] Erro durante a execução.`, error.stack);
      } finally {
        if (lockAdquirido) {
          await this.ConfiguracaoJobService.desbloquearJob(nomeJob);
        }

        // Agenda a *próxima* execução, independentemente de sucesso ou falha.
        const proximaExecucao = setTimeout(() => {
          void rodarJob();
        }, intervalo);
        this.jobTimeouts.set(nomeJob, proximaExecucao);
      }
    };

    // Inicia o primeiro "tick" 1 segundo após a aplicação subir
    // (Apenas para dar tempo de tudo se acomodar)
    const proximaExecucao = setTimeout(() => {
      void rodarJob();
    }, intervalo);
    this.jobTimeouts.set(nomeJob, proximaExecucao);
  }

  onApplicationShutdown(signal?: string) {
    this.logger.log(
      `Parando o Scheduler... (Sinal: ${signal || 'desconhecido'})`,
    );

    this.jobTimeouts.forEach((timeoutHandle, jobName) => {
      clearTimeout(timeoutHandle);
      this.logger.log(`Job [${jobName}] teve sua próxima execução cancelada.`);
    });

    this.jobTimeouts.clear();
  }
}
