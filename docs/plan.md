# PRD: App de Registro de Treinos - "Tá Pago" (Versão Atualizada)

> *Este documento foi atualizado para refletir o estado atual do protótipo de frontend. As funcionalidades marcadas como `[CONCLUÍDO] ✅` já estão implementadas na base de código.*

## 1. Visão Geral do Produto

### 1.1 Objetivo
Desenvolver um MVP (Minimum Viable Product) de um aplicativo mobile que permita aos usuários registrar facilmente seus dias de treino, especificar o tipo de treino realizado e visualizar métricas básicas de progresso.

---

## 2. Funcionalidades

### 2.1 Funcionalidades Principais

#### Registro de Treino `[CONCLUÍDO] ✅`
- Marcar o dia atual como "dia de treino".
- Selecionar tipo de treino de uma lista pré-definida.
- Adicionar observações opcionais (campo de texto livre).
- Salvar e editar treinos através de um modal.

#### Visualização do Calendário `[CONCLUÍDO] ✅`
- Calendário mensal com indicadores visuais:
  - **Dias com treino:** Ícone do treino.
  - **Dias sem treino que já passaram:** Indicador de "perdido".
  - **Dia atual:** Borda destacada.
- Navegação entre meses.
- Toque em um dia para ver detalhes ou registrar um novo treino.

#### Dashboard de Métricas `[CONCLUÍDO] ✅`
- **Seleção de Período:** Permite filtrar por semana, mês e ano.
- **Métricas da Semana/Mês/Ano:**
  - Total de treinos no período.
  - Sequência atual de dias consecutivos.
  - Percentual de consistência (dias treinados).
  - Distribuição por tipo de treino (visualização em lista com barras).
  - Distribuição de treinos por dia da semana.
  - Métrica de "dias perdidos".
- **Navegação de Período:** Permite visualizar métricas de períodos anteriores/posteriores.

### 2.2 Funcionalidades Secundárias
- **Histórico de treinos:** `[CONCLUÍDO] ✅` (Implementado através do calendário e dos dados nos hooks).
- **Editar/deletar treinos:** `[CONCLUÍDO] ✅` (O modal de registro também lida com a edição).
- **Configurações básicas (notificações):** `[PENDENTE] 🚧`

### 2.3 Funcionalidades Adicionais (Não previstas no MVP)

#### Controle de Peso `[CONCLUÍDO] ✅`
- **Registro de Peso:** Permite ao usuário adicionar, em um modal, o peso corporal para uma data específica.
- **Gráfico de Evolução:** Exibe um gráfico de linha com a evolução do peso ao longo do tempo.
- **Filtro de Período:** Permite filtrar a visualização do gráfico (7 dias, 30 dias, 90 dias, 1 ano, tudo).
- **Tabela de Histórico:** Mostra uma lista cronológica de todos os pesos registrados com a variação entre eles.

---

## 3. Requisitos Técnicos `[CONCLUÍDO] ✅`

### 3.1 Plataforma
- Desenvolvimento web responsivo simulando a experiência mobile (React).
- *Nota: O PRD original previa React Native, mas o protótipo foi feito em React para a web.*

### 3.2 Armazenamento
- Dados salvos localmente no navegador usando `localStorage` (através dos hooks `useFitLog` e `useWeightTracker`).
- Sem necessidade de conta de usuário ou backend.

### 3.3 Frameworks e Bibliotecas
- **Framework:** React com Vite.
- **Linguagem:** TypeScript.
- **UI:** Tailwind CSS e Shadcn/ui.
- **Gráficos:** Recharts.
- **Manipulação de Datas:** date-fns.

---

## 4. Design e UX

### 4.1 Fluxo Principal `[CONCLUÍDO] ✅`
1.  **Tela Inicial:** Calendário é a tela principal.
2.  **Registro:** Clicar em uma data abre um modal para seleção rápida do tipo de treino.
3.  **Confirmação:** Feedback visual de sucesso ao salvar.
4.  **Retorno:** Volta para tela inicial com dados atualizados.

### 4.2 Navegação `[CONCLUÍDO] ✅`
- Tab Bar inferior com 4 seções:
  - **Calendário:** Para registro e visualização de treinos.
  - **Estatísticas:** Dashboard de métricas.
  - **Treinos:** Para gerenciar os tipos de treino.
  - **Peso:** Para o controle de peso.

### 4.3 Princípios de Design `[CONCLUÍDO] ✅`
- Interface limpa e minimalista.
- Poucos cliques para registrar um treino.
- Feedback visual para ações.

---

## 5. Critérios de Lançamento (Para o Protótipo)

### 5.1 Funcionalidades Obrigatórias `[CONCLUÍDO] ✅`
- Registro de treino funcional.
- Visualização de calendário.
- Métricas básicas operacionais.
- Aplicativo estável (sem crashes críticos).

### 5.2 Qualidade Mínima `[CONCLUÍDO] ✅`
- Interface responsiva em diferentes tamanhos de tela.
- Dados salvos corretamente no armazenamento local.

---
## 6. Próximos Passos (Sugestões)
- `[PENDENTE] 🚧` Implementar a tela de "Treinos" para permitir a edição e criação de novos tipos de treino.
- `[PENDENTE] 🚧` Implementar a funcionalidade de deletar um treino.
- `[PENDENTE] 🚧` Refinar a responsividade para telas maiores (desktop).
- `[PENDENTE] 🚧` Integração com um backend para persistência de dados na nuvem.