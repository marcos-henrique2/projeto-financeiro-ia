// Página de gráficos: utiliza Plotly para gerar visualizações dos dados financeiros.  
// Gera gráficos de pizza para distribuição de despesas e de barras para fluxo mensal.

'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAnalysisStore } from '@/store/analysisStore';
import type { Data, Layout } from 'plotly.js';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

// Importa Plotly de forma dinâmica para evitar problemas com renderização no lado do servidor
const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

export default function ChartsPage() {
  const { sessionId, chartData, isLoading, error, fetchChartData } = useAnalysisStore();

  // Busca os dados dos gráficos sempre que existir uma sessão válida e ainda não haja dados carregados
  useEffect(() => {
    if (sessionId && !chartData) {
      fetchChartData();
    }
  }, [sessionId, chartData, fetchChartData]);

  if (!sessionId) {
    return <p className="p-4">Por favor, faça o upload de um arquivo primeiro na página de Upload.</p>;
  }

  if (isLoading) {
    return <p className="p-4">Gerando gráficos...</p>;
  }

  if (error) {
    return <p className="p-4 text-red-500">Erro: {error}</p>;
  }

  // Prepara os dados e layouts para os gráficos
  const pieChartData: Data[] =
    chartData?.despesas_categoria
      ? [
          {
            labels: chartData.despesas_categoria.labels,
            values: chartData.despesas_categoria.values,
            type: 'pie',
            hole: 0.4,
          },
        ]
      : [];

  const pieChartLayout: Partial<Layout> = {
    title: { text: 'Distribuição de Despesas por Categoria' },
  };

  const barChartData: Data[] =
    chartData?.fluxo_mensal
      ? [
          {
            x: chartData.fluxo_mensal.meses,
            y: chartData.fluxo_mensal.receitas,
            type: 'bar',
            name: 'Receitas',
            marker: { color: 'green' },
          },
          {
            x: chartData.fluxo_mensal.meses,
            y: chartData.fluxo_mensal.despesas.map((d) => Math.abs(d)),
            type: 'bar',
            name: 'Despesas',
            marker: { color: 'red' },
          },
        ]
      : [];

  const barChartLayout: Partial<Layout> = {
    title: { text: 'Fluxo de Caixa Mensal (Receitas vs. Despesas)' },
    barmode: 'group',
  };

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Análise Visual</h2>
      <div className="grid gap-8 lg:grid-cols-2">
        {chartData?.despesas_categoria && (
          <Card>
            <CardHeader>
              <CardTitle>Despesas por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <Plot data={pieChartData} layout={pieChartLayout} className="w-full h-full" />
            </CardContent>
          </Card>
        )}
        {chartData?.fluxo_mensal && (
          <Card>
            <CardHeader>
              <CardTitle>Fluxo de Caixa Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <Plot data={barChartData} layout={barChartLayout} className="w-full h-full" />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}