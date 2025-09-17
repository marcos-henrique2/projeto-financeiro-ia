'use client';

import { useEffect } from 'react';
import { useAnalysisStore } from '@/store/analysisStore';
import dynamic from 'next/dynamic';
import { Data, Layout } from 'plotly.js'; // Keep this import

// Importação dinâmica do Plotly
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function ChartsPage() {
  const { sessionId, chartData, isLoading, error, fetchChartData } = useAnalysisStore();

  useEffect(() => {
    if (sessionId && !chartData) {
      fetchChartData();
    }
  }, [sessionId, chartData, fetchChartData]);

  if (!sessionId) {
    return <p>Por favor, faça o upload de um arquivo primeiro na página de Upload.</p>;
  }

  if (isLoading) {
    return <p>Gerando gráficos...</p>;
  }

  if (error) {
    return <p className="text-red-500">Erro: {error}</p>;
  }

  // --- Prepara os dados e layouts para os gráficos com os tipos corretos ---
  
  const pieChartData: Data[] = chartData?.despesas_categoria ? [
    {
      labels: chartData.despesas_categoria.labels,
      values: chartData.despesas_categoria.values,
      type: 'pie',
      hole: .4,
    },
  ] : [];

  const pieChartLayout: Partial<Layout> = {
    // CORREÇÃO AQUI
    title: { text: 'Distribuição de Despesas por Categoria' },
  };

  const barChartData: Data[] = chartData?.fluxo_mensal ? [
    {
      x: chartData.fluxo_mensal.meses,
      y: chartData.fluxo_mensal.receitas,
      type: 'bar',
      name: 'Receitas',
      marker: { color: 'green' }
    },
    {
      x: chartData.fluxo_mensal.meses,
      y: chartData.fluxo_mensal.despesas.map(d => Math.abs(d)),
      type: 'bar',
      name: 'Despesas',
      marker: { color: 'red' }
    },
  ] : [];

  const barChartLayout: Partial<Layout> = {
    // E CORREÇÃO AQUI
    title: { text: 'Fluxo de Caixa Mensal (Receitas vs. Despesas)' },
    barmode: 'group'
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Análise Visual</h2>
      <div className="grid gap-8 lg:grid-cols-2">
        {chartData?.despesas_categoria && (
          <div className="p-4 border rounded-lg shadow-sm">
            <Plot
              data={pieChartData}
              layout={pieChartLayout}
              className="w-full h-full"
            />
          </div>
        )}
        {chartData?.fluxo_mensal && (
           <div className="p-4 border rounded-lg shadow-sm">
            <Plot
              data={barChartData}
              layout={barChartLayout}
              className="w-full h-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}