# 🚀 Agendador de Tarefas Dinâmico

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## 📋 Sobre o Projeto

Projeto desenvolvido por conta própria com o objetivo de consolidar conhecimentos em **NestJS**, explorando as funcionalidades do framework além da criação tradicional de APIs REST.

Este projeto demonstra a construção de um **agendador de tarefas dinâmico** que executa jobs configuráveis de acordo com uma tabela de agendamentos armazenada em um banco de dados PostgreSQL.

## 🎯 Objetivos de Aprendizado

- Utilizar o **NestJS CLI** para estruturação modular
- Implementar **agendamento dinâmico de tarefas** sem usar APIs REST
- Trabalhar com **TypeORM** e PostgreSQL
- Gerenciar **ciclo de vida de módulos** (OnModuleInit, OnApplicationShutdown)
- Implementar **sistema de locks** para prevenir execuções concorrentes
- Utilizar **padrões assíncronos** do Node.js com Promises e setTimeout recursivo
- Integrar com APIs externas usando **@nestjs/axios**

## 🏗️ Arquitetura

O projeto é composto por três módulos principais:

### 1. **Configurador de Jobs** (`configurador-job`)

- Gerencia as configurações de jobs no banco de dados
- Implementa sistema de **lock otimista** usando queries SQL
- Métodos principais:
  - `tentarBloquearJob()`: Adquire lock antes da execução
  - `desbloquearJob()`: Libera lock após execução
  - `buscarTodosJobs()`: Retorna todos os jobs configurados

### 2. **Agendador** (`agendador`)

- Cérebro do sistema que orquestra a execução dos jobs
- Implementa **loop recursivo** com setTimeout
- Gerencia **parada elegante** aguardando jobs em execução
- Usa Map para rastrear:
  - Jobs agendados (`jobsAgendadas`)
  - Jobs em execução (`jobsEmExecucao`)

### 3. **Coletor de Preço de Moeda** (`coletor-preco-moeda`)

- Job de demonstração que coleta cotação USD-BRL
- Integração com API externa (AwesomeAPI)
- Demonstra execução assíncrona de tarefas

## 🔧 Tecnologias Utilizadas

- **NestJS** - Framework principal
- **TypeScript** - Linguagem de programação
- **TypeORM** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados
- **Axios** - Cliente HTTP
- **Docker Compose** - Orquestração de containers

## 📦 Pré-requisitos

- Node.js (v18+)
- Docker e Docker Compose
- npm ou yarn

## 🚀 Como Executar

### 1. Clone o repositório

```bash
git clone https://github.com/gab-szz/dynamic-job-runner.git
cd dynamic-job-runner
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Inicie o banco de dados PostgreSQL

```bash
docker-compose up -d
```

### 4. Execute a aplicação

```bash
# Modo desenvolvimento
npm run start:dev

# Modo produção
npm run build
npm run start:prod
```

## 📊 Funcionamento

1. **Inicialização**: Ao iniciar, o módulo `ConfiguracaoJobService` cria um job de exemplo no banco
2. **Agendamento**: O `AgendamentoService` carrega os jobs e inicia loops recursivos
3. **Execução**: A cada intervalo configurado:
   - Tenta adquirir lock no banco de dados
   - Se bem-sucedido, executa o job
   - Libera o lock ao finalizar
   - Agenda próxima execução
4. **Shutdown**: Cancela próximas execuções e aguarda jobs em andamento

## 🗄️ Estrutura do Banco de Dados

Tabela `configuracao_job`:

- `job_name` (VARCHAR, PK) - Nome único do job
- `interval_seconds` (INTEGER) - Intervalo de execução em segundos
- `is_running` (BOOLEAN) - Flag de lock para execução
- `last_run_start` (TIMESTAMP) - Timestamp da última execução

## 📝 Exemplo de Job

O job `currency-collector` coleta a cotação USD-BRL a cada 60 segundos:

```typescript
{
  job_name: 'currency-collector',
  interval_seconds: 60,
  is_running: false
}
```

## 🔍 Logs

A aplicação fornece logs detalhados de:

- Aquisição e liberação de locks
- Início e fim de execuções
- Erros durante processamento
- Processo de shutdown

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento com watch mode
npm run start:dev

# Build para produção
npm run build

# Formatação de código
npm run format

# Linting
npm run lint
```

## 🎓 Aprendizados

Este projeto permitiu explorar:

- Uso não-convencional do NestJS (sem controllers)
- Gerenciamento de estado com locks em banco de dados
- Padrões de concorrência e execução assíncrona
- Ciclo de vida de aplicações NestJS
- Integração com APIs externas

## 📄 Licença

Este projeto é de uso educacional e está sob licença UNLICENSED.

## 👤 Autor

Desenvolvido como projeto de estudo pessoal para consolidação de conhecimentos em NestJS.
