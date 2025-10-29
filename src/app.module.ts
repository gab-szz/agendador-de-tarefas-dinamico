// src/app.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfiguracaoJobModule } from './configurador-job/configuracao.module';
import { ConfiguracaoJob } from './configurador-job/configuracao.entity';
import { ColetorPrecoMoedaModule } from './coletor-preco-moeda/coletor.module';
import { HttpModule } from '@nestjs/axios';
import { AgendadorModule } from './agendador/agendador.module';

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
    ColetorPrecoMoedaModule,
    AgendadorModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
