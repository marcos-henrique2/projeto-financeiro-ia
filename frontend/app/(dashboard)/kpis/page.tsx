// Página de KPIs: exibe indicadores de desempenho financeiros em cartões.  
// Carrega os dados automaticamente quando há um ID de sessão ativo.

'use client';

import { useEffect } from 'react';
import { useAnalysisStore } from '@/store/analysisStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function KpisPage() {
  const { sessionId, kpis, isLoading, error, fetchKpis } = useAnalysisStore();

  // Quando o componente monta ou quando dependências mudam, busca as KPIs se necessário
  useEffect(() => {
    if (sessionId && !kpis) {
      fetchKpis();
    }
  }, [sessionId, kpis, fetchKpis]);

  if (!sessionId) {
    return <p className="p-4">Por favor, faça o upload de um arquivo primeiro.</p>;
  }

  if (isLoading) {
    return <p className="p-4">Calculando KPIs...</p>;
  }

  if (error) {
    return <p className="p-4 text-red-500">Erro: {error}</p>;
  }

  return (
    <div className="container mx-auto py-8">
      <h2 className="text-2xl font-bold mb-6">Dashboard de KPIs</h2>
      {kpis ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          {Object.entries(kpis).map(([title, value]) => (
            <Card key={title}>
              <CardHeader>
                <CardTitle>{title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xl font-semibold">{String(value)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p>Nenhuma KPI encontrada.</p>
      )}
    </div>
  );
}