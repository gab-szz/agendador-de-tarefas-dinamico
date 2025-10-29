import {
  Injectable,
  Logger,
  OnModuleInit,
  OnApplicationShutdown,
} from '@nestjs/common';
import { ConfiguracaoJobService } from '../configurador-job/configuracao.service';
import { ColetorPrecoMoedaService } from '../coletor-preco-moeda/coletor.service';

@Injectable()
export class AgendamentoService implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(AgendamentoService.name);
  private jobsAgendadas = new Map<string, NodeJS.Timeout>();
  private jobsEmExecucao = new Map<string, Promise<any>>();

  constructor(
    private readonly ConfiguracaoJobService: ConfiguracaoJobService,
    private readonly coletorPrecoMoedaService: ColetorPrecoMoedaService,
  ) {}

  //
  // 1. O INICIADOR: Apenas "liga os motores"
  //
  async onModuleInit() {
    this.logger.log('Iniciando AgendamentoService...');
    this.logger.log('Carregando jobs do banco de dados...');

    const jobs = await this.ConfiguracaoJobService.buscarTodosJobs();
    if (jobs.length === 0) {
      this.logger.warn('Nenhum job encontrado para agendar.');
      return;
    }

    this.logger.log(`Encontrados ${jobs.length} job(s). Agendando...`);

    // Inicia os loops de forma NÃO-BLOQUEANTE
    jobs.forEach((job) => {
      const intervalo = job.interval_seconds * 1000;
      this._iniciarLoopDoJob(job.job_name, intervalo);
      this.logger.log(
        `Job [${job.job_name}] agendado para rodar a cada ${job.interval_seconds}s.`,
      );
    });
  }

  //
  // 2. O MOTOR: Gerencia o loop recursivo do job.
  //
  private _iniciarLoopDoJob(nomeJob: string, intervalo: number) {
    // Esta é a função que será chamada recursivamente
    const executarTick = () => {
      const jobPromise = this._rodarTrabalho(nomeJob);
      this.jobsEmExecucao.set(nomeJob, jobPromise);

      void jobPromise.finally(() => {
        this.jobsEmExecucao.delete(nomeJob);

        const proximoHandle = setTimeout(executarTick, intervalo);
        this.jobsAgendadas.set(nomeJob, proximoHandle);
      });
    };

    // Inicia o PRIMEIRO tick (1 segundo após o startup)
    const handleInicial = setTimeout(executarTick, 1000);
    this.jobsAgendadas.set(nomeJob, handleInicial);
  }

  //
  // 3. O ESPECIALISTA: Apenas executa o trabalho UMA VEZ.
  //    (Note que ele não sabe nada sobre 'setTimeout' ou 'intervalo')
  //
  private async _rodarTrabalho(nomeJob: string): Promise<void> {
    this.logger.log(`TICK: [${nomeJob}]`);
    let lockAdquirido = false;

    try {
      lockAdquirido =
        await this.ConfiguracaoJobService.tentarBloquearJob(nomeJob);

      if (lockAdquirido) {
        this.logger.log(`[${nomeJob}] Lock adquirido. INICIANDO execução...`);

        if (nomeJob === 'currency-collector') {
          await this.coletorPrecoMoedaService.coletarInformacoes();
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
        // A única responsabilidade no finally é destravar.
        await this.ConfiguracaoJobService.desbloquearJob(nomeJob);
      }
    }
  }

  //
  // 4. PARADA ELEGANTE
  //
  async onApplicationShutdown(signal?: string) {
    this.logger.log(
      `[Parada Elegante] Iniciado... (Sinal: ${signal || 'N/A'})`,
    );

    // ... (seu código de parada elegante está correto) ...
    this.logger.log(`Cancelando ${this.jobsAgendadas.size} jobs agendados...`);
    this.jobsAgendadas.forEach((timeoutHandle, jobName) => {
      clearTimeout(timeoutHandle);
      this.logger.log(`- [${jobName}] Próxima execução cancelada.`);
    });
    this.jobsAgendadas.clear();

    if (this.jobsEmExecucao.size > 0) {
      this.logger.log(
        `Aguardando ${this.jobsEmExecucao.size} job(s) em execução...`,
      );
      try {
        const emExecucao = Array.from(this.jobsEmExecucao.values());
        await Promise.allSettled(emExecucao);
        this.logger.log('Todos os jobs em execução terminaram.');
      } catch (error) {
        this.logger.error('Erro ao aguardar jobs em execução.', error);
      }
    } else {
      this.logger.log('Nenhum job em execução.');
    }

    this.jobsEmExecucao.clear();
    this.logger.log('[Parada Elegante] Concluído.');
  }
}
