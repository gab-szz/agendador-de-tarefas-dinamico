// src/job-config/job-config.entity.ts
import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('job_configs')
export class ConfiguracaoJob {
  @PrimaryColumn({ type: 'varchar', length: 100 })
  job_name: string;

  @Column({ type: 'boolean', default: false })
  is_running: boolean;

  @Column({ type: 'int', default: 60, comment: 'Intervalo em segundos' })
  interval_seconds: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  last_run_start: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', nullable: true })
  last_run_finish: Date;
}
