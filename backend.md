# Plano de Implementação: Backend para "Tá Pago"

Este documento descreve o plano para construir o backend do aplicativo "Tá Pago", substituindo o `localStorage` por um servidor robusto e um banco de dados PostgreSQL.

---

## 1. Arquitetura e Stack Tecnológica

Para manter a sinergia com o frontend, a stack escolhida é baseada em TypeScript.

- **Plataforma:** Node.js
- **Framework:** Express.js (para roteamento e middlewares)
- **Linguagem:** TypeScript
- **ORM (Object-Relational Mapping):** Prisma (facilita a interação com o banco de dados e garante a tipagem)
- **Banco de Dados:** PostgreSQL
- **Autenticação:** JWT (JSON Web Tokens)
- **Validação:** Zod (para validar os payloads da API)

---

## 2. Esquema do Banco de Dados (Prisma Schema)

O esquema abaixo define as tabelas necessárias para suportar as funcionalidades da aplicação.

```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  workoutLogs  WorkoutLog[]
  weightEntries WeightEntry[]
}

model WorkoutType {
  id    String @id @default(uuid())
  name  String @unique // "Treino A", "Cardio", etc.
  icon  String // Emoji ou nome do ícone

  workoutLogs WorkoutLog[]
}

model WorkoutLog {
  id          String   @id @default(uuid())
  date        DateTime
  notes       String?
  customType  String?

  userId String
  user   User   @relation(fields: [userId], references: [id])

  typeId String
  type   WorkoutType @relation(fields: [typeId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, date]) // Um usuário só pode ter um treino por dia
}

model WeightEntry {
  id     String   @id @default(uuid())
  date   DateTime
  weight Float

  userId String
  user   User   @relation(fields: [userId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, date]) // Um usuário só pode ter um registro de peso por dia
}
```

---

## 3. Endpoints da API REST

A seguir estão os endpoints necessários para a comunicação com o frontend.

### Autenticação (`/auth`)
- `POST /auth/register`: Registrar um novo usuário.
- `POST /auth/login`: Autenticar um usuário e retornar um JWT.

### Tipos de Treino (`/workout-types`)
- `GET /workout-types`: Listar todos os tipos de treino pré-definidos.

### Registros de Treino (`/workouts`)
- `POST /workouts`: Criar um novo registro de treino para o usuário autenticado.
- `GET /workouts`: Listar todos os treinos do usuário (com filtros de data).
- `PUT /workouts/:id`: Atualizar um registro de treino existente.
- `DELETE /workouts/:id`: Deletar um registro de treino.

### Registros de Peso (`/weight`)
- `POST /weight`: Criar um novo registro de peso.
- `GET /weight`: Listar todos os registros de peso do usuário (com filtros de data).
- `PUT /weight/:id`: Atualizar um registro de peso.
- `DELETE /weight/:id`: Deletar um registro de peso.

### Estatísticas (`/stats`)
- `GET /stats`: Obter as estatísticas calculadas (total, sequência, etc.) para um determinado período (semana, mês, ano). O backend fará a lógica de cálculo.

---

## 4. Roteiro de Implementação em Fases

### Fase 1: Configuração e Fundação do Backend
1.  **Inicializar Projeto:** Criar um novo diretório `backend/` e inicializar um projeto Node.js com `npm init`.
2.  **Instalar Dependências:** Adicionar `express`, `prisma`, `typescript`, `ts-node`, `pg`, `dotenv`, `bcryptjs`, `jsonwebtoken`, `zod`.
3.  **Configurar TypeScript:** Criar um `tsconfig.json` com as configurações adequadas para um projeto Node.js.
4.  **Configurar Prisma:** Executar `npx prisma init` e configurar o `schema.prisma` com o modelo de dados definido acima.
5.  **Docker para Postgres:** Criar um `docker-compose.yml` para subir uma instância do PostgreSQL localmente, facilitando o desenvolvimento.
6.  **Estrutura de Pastas:** Definir a estrutura de pastas (ex: `src/routes`, `src/controllers`, `src/services`).

### Fase 2: Autenticação de Usuários
1.  **Implementar Rota de Registro:** Criar o controller e o serviço para a rota `POST /auth/register`, incluindo o hash da senha com `bcrypt`.
2.  **Implementar Rota de Login:** Criar a rota `POST /auth/login`, comparando a senha e gerando um JWT em caso de sucesso.
3.  **Criar Middleware de Autenticação:** Desenvolver um middleware para Express que verifica o token JWT em rotas protegidas e anexa os dados do usuário à requisição.

### Fase 3: Implementação do CRUD Core
1.  **CRUD de Treinos:** Implementar todas as rotas de `/workouts`, protegendo-as com o middleware de autenticação.
2.  **CRUD de Pesos:** Implementar as rotas de `/weight`, também protegidas.
3.  **Seed de Tipos de Treino:** Criar um script de seed do Prisma para popular a tabela `WorkoutType` com os valores padrão.

### Fase 4: Endpoints de Lógica de Negócio
1.  **Implementar Rota de Estatísticas:** Criar a rota `GET /stats` que recebe um período como query param.
2.  **Desenvolver Lógica de Cálculo:** No lado do servidor, criar as funções para calcular o total de treinos, a sequência de dias, a consistência e as distribuições, com base nos dados do usuário autenticado.

### Fase 5: Integração com o Frontend
1.  **Configurar Proxy:** Ajustar o `vite.config.ts` do frontend para usar um proxy, facilitando as chamadas à API local.
2.  **Remover Hooks Mocks:** Modificar os hooks (`useFitLog`, `useWeightTracker`) para, em vez de usar `localStorage`, fazerem chamadas à API do backend usando `fetch` ou uma biblioteca como `axios`.
3.  **Implementar Fluxo de Login no Frontend:** Criar as telas de Login/Registro e gerenciar o estado de autenticação (armazenar o JWT).
4.  **Proteger Rotas no Frontend:** Garantir que o usuário só possa acessar a aplicação principal após estar autenticado.
