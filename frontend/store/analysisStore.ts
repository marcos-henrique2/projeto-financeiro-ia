// frontend/store/analysisStore.ts

import { create } from 'zustand';

type KpiData = { /* ... (sem alterações) ... */ };

// NOVO: Define o formato dos dados dos gráficos
type ChartData = {
  despesas_categoria: {
    labels: string[];
    values: number[];
  };
  fluxo_mensal: {
    meses: string[];
    receitas: number[];
    despesas: number[];
  };
};

interface AnalysisState {
  sessionId: string | null;
  kpis: KpiData | null;
  chartData: ChartData | null; // <-- NOVO ESTADO
  isLoading: boolean;
  error: string | null;
  setSessionId: (id: string) => void;
  fetchKpis: () => Promise<void>;
  fetchChartData: () => Promise<void>; // <-- NOVA AÇÃO
}

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  // Estado Inicial
  sessionId: null,
  kpis: null,
  chartData: null, // <-- NOVO
  isLoading: false,
  error: null,

  // Ações
  setSessionId: (id: string) => set({ sessionId: id, kpis: null, chartData: null, error: null }),

  fetchKpis: async () => { /* ... (sem alterações) ... */ },

  // NOVA AÇÃO para buscar os dados dos gráficos
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
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      set({ error: errorMessage, isLoading: false });
    }
  },
}));