# PRD: App de Registro de Treinos - "Tá Pago"

## 1. Visão Geral do Produto

### 1.1 Objetivo
Desenvolver um MVP (Minimum Viable Product) de um aplicativo mobile que permita aos usuários registrar facilmente seus dias de treino, especificar o tipo de treino realizado e visualizar métricas básicas de progresso.

---

## 2. Funcionalidades do MVP

### 2.1 Funcionalidades Principais

#### Registro de Treino
- Marcar o dia atual como "dia de treino".
- Selecionar tipo de treino de uma lista pré-definida:
  - Treino A
  - Treino B
  - Treino C
  - Treino D
  - Treino E
  - Treino F
  - Cardio
  - Funcional
  - Corrida
  - Caminhada
  - Natação
  - Yoga/Pilates
  - Outro (campo livre)
- Adicionar observações opcionais (campo de texto livre, máximo 280 caracteres).
- Botão "Salvar Treino".

#### Visualização do Calendário
- Calendário mensal com indicadores visuais:
  - **Dias com treino:** Círculo verde.
  - **Dias sem treino que já passaram:** Círculo vermelho.
  - **Dia atual:** Borda destacada.
- Navegação entre meses (setas `< >`).
- Toque em um dia para ver detalhes do treino (qual foi feito).

#### Dashboard de Métricas
- **Métricas da Semana Atual:**
  - Total de treinos na semana.
  - Sequência atual de dias consecutivos.
  - Tipo de treino mais frequente.
- **Métricas do Mês Atual:**
  - Total de treinos no mês.
  - Percentual de dias treinados.
  - Distribuição por tipo de treino (gráfico de pizza simples).
  - Distribuição de treinos por dia da semana no mês.
- **Métricas do Ano Atual:**
  - Total de treinos no ano.
  - Percentual de dias treinados.
  - Distribuição por tipo de treino (gráfico de pizza simples).
  - Distribuição de treinos por dia da semana no ano.

### 2.2 Funcionalidades Secundárias
- Histórico de treinos (lista cronológica).
- Editar/deletar treinos já registrados.
- Configurações básicas (notificações sim/não).

---

## 3. Requisitos Técnicos

### 3.1 Plataforma
- Desenvolvimento mobile híbrido (React Native).
- Suporte inicial para Android e iOS.

### 3.2 Armazenamento
- Dados salvos localmente no dispositivo.
- Sem necessidade de conta de usuário ou backend para o MVP.

### 3.3 Frameworks e Bibliotecas
- Framework de desenvolvimento híbrido.
- Biblioteca para calendário.
- Biblioteca para gráficos simples.
- Armazenamento local (AsyncStorage/SQLite).

---

## 4. Design e UX

### 4.1 Fluxo Principal
1.  **Tela Inicial:** Calendário em que dá para registrar que treinou clicando na data.
2.  **Registro:** Seleção rápida do tipo de treino + observações opcionais.
3.  **Confirmação:** Feedback visual de sucesso.
4.  **Retorno:** Volta para tela inicial com métricas atualizadas.

### 4.2 Navegação
- Tab Bar com 3 seções:
  - **Registro:** Calendário para registrar treino.
  - **Calendário:** Visualização semanal, mensal e anual.
  - **Treinos:** Editar os tipos de treino.

### 4.3 Princípios de Design
- Interface limpa e minimalista.
- Máximo 3 taps para registrar um treino.
- Feedback visual imediato para todas as ações.
- Cores motivacionais (verde para sucesso, azul para informação).

---

## 8. Critérios de Lançamento

### 8.1 Funcionalidades Obrigatórias
- Registro de treino funcional.
- Visualização de calendário.
- Métricas básicas operacionais.
- Aplicativo estável (sem crashes críticos).

### 8.2 Qualidade Mínima
- Tempo de carregamento < 3 segundos.
- Interface responsiva em diferentes tamanhos de tela.
- Dados salvos corretamente no armazenamento local.