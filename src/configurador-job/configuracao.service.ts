import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfiguracaoJob } from './configuracao.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ConfiguracaoJobService implements OnModuleInit {
  private readonly logger: Logger = new Logger(ConfiguracaoJobService.name);

  constructor(
    @InjectRepository(ConfiguracaoJob)
    private readonly ConfiguracaoJobRepository: Repository<ConfiguracaoJob>,
    private readonly dataSource: DataSource,
  ) {}

  async onModuleInit() {
    this.logger.log('Inicializando ConfiguracaoJobService...');
    try {
      await this.ConfiguracaoJobRepository.save({
        job_name: 'currency-collector',
        interval_seconds: 60,
        is_running: false,
      });
      this.logger.log('Job [currency-collector] semeado no banco de dados.');
    } catch (error) {
      if (error.code !== '23505') {
        this.logger.error('Erro ao semear job', error.stack);
      } else {
        this.logger.log(
          'Job [currency-collector] já existe. Resetando estado...',
        );

        await this.desbloquearJob('currency-collector');
      }
    }
  }

  async desbloquearJob(jobName: string): Promise<void> {
    this.logger.log(`Liberando lock para: ${jobName}`);
    await this.ConfiguracaoJobRepository.update(
      { job_name: jobName },
      {
        is_running: false,
      },
    );
  }

  async tentarBloquearJob(jobName: string): Promise<boolean> {
    this.logger.log(`Tentando adquirir lock para: ${jobName}`);

    const updateResult = await this.dataSource
      .createQueryBuilder()
      .update(ConfiguracaoJob)
      .set({
        is_running: true,
        last_run_start: new Date(),
      })
      .where('job_name = :jobName', { jobName })
      .andWhere('is_running = false')
      .execute();

    return this.verificarLockAdquirido(Number(updateResult.affected), jobName);
  }

  private verificarLockAdquirido(affectedRows: number, jobName: string) {
    if (affectedRows === 1) {
      this.logger.log(`Lock adquirido para: ${jobName}`);
    } else {
      this.logger.warn(`Lock NÃO adquirido para: ${jobName} (já em execução)`);
    }

    return affectedRows === 1;
  }

  async buscarTodosJobs(): Promise<ConfiguracaoJob[]> {
    return this.ConfiguracaoJobRepository.find();
  }
}
