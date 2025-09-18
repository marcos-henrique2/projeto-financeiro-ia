// Zustand store para gerenciar o estado da análise financeira.
// Inclui dados de KPIs, dados de gráficos e estado de sessão.

import { create } from 'zustand';

// Estrutura básica para as KPIs retornadas pela API.  
// As chaves representam nomes de indicadores e os valores podem ser números ou strings.
export interface KpiData {
  [key: string]: string | number;
}

// Define o formato esperado para os dados de gráficos retornados pela API.
export interface ChartData {
  despesas_categoria: {
    labels: string[];
    values: number[];
  };
  fluxo_mensal: {
    meses: string[];
    receitas: number[];
    despesas: number[];
  };
}

// Interface que descreve todo o estado gerenciado pelo zustand.
interface AnalysisState {
  sessionId: string | null;
  kpis: KpiData | null;
  chartData: ChartData | null;
  /** Dados normalizados da planilha, utilizados para exibir a tabela detalhada. */
  data: any[] | null;
  /** Relatório textual gerado sobre um tema específico. */
  report: string | null;
  isLoading: boolean;
  error: string | null;
  setSessionId: (id: string) => void;
  fetchKpis: () => Promise<void>;
  fetchChartData: () => Promise<void>;
  fetchData: () => Promise<void>;
  generateReport: (topic: string) => Promise<void>;
}

/**
 * Cria uma store usando zustand para centralizar o estado e as ações
 * relacionadas à análise.  
 * Esta store facilita o compartilhamento de dados entre diferentes páginas
 * (ex.: upload, KPIs e gráficos) sem a necessidade de prop drilling.
 */
export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  // Estado inicial
  sessionId: null,
  kpis: null,
  chartData: null,
  data: null,
  report: null,
  isLoading: false,
  error: null,

  /**
   * Atualiza o ID da sessão e limpa dados anteriores.  
   * Deve ser chamada sempre que um novo upload for realizado.
   */
  setSessionId: (id: string) => set({ sessionId: id, kpis: null, chartData: null, error: null }),

  /**
   * Busca os KPIs da sessão atual no backend.  
   * Atualiza o estado com o resultado ou mensagem de erro.
   */
  fetchKpis: async () => {
    const { sessionId } = get();
    if (!sessionId) return;
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`http://localhost:8000/kpis/${sessionId}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar as KPIs.');
      }
      const data: KpiData = await response.json();
      set({ kpis: data, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      set({ error: message, isLoading: false });
    }
  },

  /**
   * Busca os dados dos gráficos da sessão atual no backend.  
   * Define o estado de carregamento durante a requisição e trata erros.
   */
  fetchChartData: async () => {
    const { sessionId } = get();
    if (!sessionId) return;
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`http://localhost:8000/charts/${sessionId}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar os dados dos gráficos.');
      }
      const data: ChartData = await response.json();
      set({ chartData: data, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      set({ error: message, isLoading: false });
    }
  },

  /**
   * Busca os dados normalizados da planilha para exibição em tabela.  
   * A API deve retornar um array de objetos (linhas) com chaves iguais aos nomes das colunas.
   */
  fetchData: async () => {
    const { sessionId } = get();
    if (!sessionId) return;
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`http://localhost:8000/data/${sessionId}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar dados normalizados.');
      }
      const data = await response.json();
      set({ data, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      set({ error: message, isLoading: false });
    }
  },

  /**
   * Gera um relatório textual a partir de um tema específico.  
   * O relatório é produzido pelo back‑end (por exemplo, usando IA) e retorna uma string.
   */
  generateReport: async (topic: string) => {
    const { sessionId } = get();
    if (!sessionId) return;
    set({ isLoading: true, error: null });
    try {
      const encoded = encodeURIComponent(topic);
      const response = await fetch(`http://localhost:8000/report/${sessionId}?topic=${encoded}`);
      if (!response.ok) {
        throw new Error('Falha ao gerar relatório.');
      }
      const { report } = await response.json();
      set({ report, isLoading: false });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      set({ error: message, isLoading: false });
    }
  },
}));