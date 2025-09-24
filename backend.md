# Plano de Implementação: Full-Stack com Next.js para "Tá Pago"

Este documento descreve o plano para evoluir o protótipo "Tá Pago" para uma aplicação full-stack, migrando de Vite para Next.js e implementando o backend diretamente no ecossistema Next.js com um banco de dados PostgreSQL.

---

## **Parte 1: Plano de Migração de Vite para Next.js**

O objetivo desta fase é reestruturar o projeto atual para a arquitetura do Next.js, preservando os componentes e a lógica de UI existentes.

### **1.1. Estrutura do Projeto e Dependências**
1.  **Inicializar Projeto Next.js:** Criar um novo projeto Next.js com o App Router: `npx create-next-app@latest --typescript --tailwind --eslint`.
2.  **Copiar Componentes:** Mover os componentes de `src/components` do projeto Vite para `components/` no projeto Next.js.
3.  **Copiar Páginas:** Migrar a lógica de `src/pages/Index.tsx` para a página principal do Next.js em `app/page.tsx`.
4.  **Instalar Dependências:** Adicionar as dependências do `package.json` anterior que ainda são necessárias (ex: `recharts`, `date-fns`, `lucide-react`).
5.  **Configurar CSS:** Migrar as configurações de `tailwind.config.ts` e o CSS global de `index.css` para o `globals.css` do Next.js.
6.  **Hooks e Libs:** Mover os arquivos de `src/hooks` e `src/lib` para diretórios equivalentes no novo projeto.

### **1.2. Roteamento e Layout**
1.  **Layout Principal:** Criar um `app/layout.tsx` que contenha a estrutura principal da página (header, navegação inferior).
2.  **Página Principal:** O conteúdo de `app/page.tsx` será a página do calendário, que é a tela inicial.
3.  **Gerenciamento de Estado de Abas:** A lógica de troca de abas (Calendário, Estatísticas, etc.) será mantida no `page.tsx` principal, renderizando os componentes condicionalmente.

---

## **Parte 2: Plano de Implementação do Backend em Next.js**

Com o frontend migrado, esta fase foca na construção da lógica de servidor usando as funcionalidades do Next.js.

### **2.1. Arquitetura e Stack Tecnológica**
- **Framework Full-Stack:** Next.js (com App Router)
- **Linguagem:** TypeScript
- **ORM:** Prisma
- **Banco de Dados:** PostgreSQL
- **Autenticação:** Next-Auth.js (para integração simplificada com React)
- **Validação:** Zod

### **2.2. Esquema do Banco de Dados (Prisma Schema)**
O esquema do banco de dados permanece o mesmo do plano anterior, pois os requisitos de dados não mudaram.

```prisma
// file: prisma/schema.prisma

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

// ... (outros modelos: WorkoutType, WorkoutLog, WeightEntry) ...
```

### **2.3. API Routes e Server Actions**
Os endpoints serão criados como API Routes dentro do diretório `app/api/`.

- **Autenticação:**
  - `app/api/auth/[...nextauth]/route.ts`: Rota catch-all para o Next-Auth.js, que gerenciará o login, registro e sessão.
- **Tipos de Treino:**
  - `app/api/workout-types/route.ts` -> `GET`: Listar todos os tipos de treino.
- **Registros de Treino:**
  - `app/api/workouts/route.ts` -> `GET`, `POST`
  - `app/api/workouts/[id]/route.ts` -> `PUT`, `DELETE`
- **Registros de Peso:**
  - `app/api/weight/route.ts` -> `GET`, `POST`
  - `app/api/weight/[id]/route.ts` -> `PUT`, `DELETE`
- **Estatísticas:**
  - `app/api/stats/route.ts` -> `GET`

### **2.4. Roteiro de Implementação em Fases**

#### **Fase 1: Configuração da Fundação**
1.  **Integrar Prisma:** Adicionar o Prisma ao projeto Next.js e conectar ao banco de dados PostgreSQL (localmente via Docker).
2.  **Configurar Next-Auth.js:**
    - Instalar `next-auth`.
    - Configurar o provedor de `Credentials` para login com e-mail e senha.
    - Usar o adapter do Prisma para o Next-Auth.js para sincronizar usuários.
3.  **Seed do Banco de Dados:** Criar o script de seed para popular os `WorkoutType`.

#### **Fase 2: Implementação das API Routes**
1.  **CRUD de Treinos:** Criar os handlers para as rotas de `/api/workouts`, garantindo que as operações sejam autenticadas e associadas ao usuário da sessão.
2.  **CRUD de Pesos:** Implementar as rotas para `/api/weight`.
3.  **Lógica de Estatísticas:** Criar a rota `/api/stats` que executa as queries complexas no servidor para calcular as métricas.

#### **Fase 3: Integração com o Frontend**
1.  **Hooks de Dados:** Refatorar os hooks (`useFitLog`, `useWeightTracker`) para usar `fetch` para chamar as API Routes internas, em vez de `localStorage`. O uso de `SWR` ou `React Query` é recomendado para caching e revalidação.
2.  **Autenticação no Cliente:** Usar o hook `useSession` do Next-Auth.js para gerenciar o estado de login na UI.
3.  **Proteger a UI:** Envolver a página principal em um componente que verifica se o usuário está autenticado, redirecionando para uma página de login caso contrário.
4.  **Server Components:** Onde possível (ex: na listagem inicial de dados), usar Server Components para buscar dados diretamente no servidor, melhorando a performance de carregamento inicial.