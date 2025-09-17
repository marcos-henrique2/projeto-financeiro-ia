// frontend/app/(dashboard)/kpis/page.tsx

'use client';

import { useEffect } from 'react';
import { useAnalysisStore } from '@/store/analysisStore';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function KpisPage() {
  const { sessionId, kpis, isLoading, error, fetchKpis } = useAnalysisStore();

  useEffect(() => {
    if (sessionId && !kpis) {
      fetchKpis();
    }
  }, [sessionId, kpis, fetchKpis]);

  if (!sessionId) {
    return (
      <div className="container mx-auto p-8">
        <p>Por favor, faça o upload de um arquivo primeiro.</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="container mx-auto p-8"><p>Calculando KPIs...</p></div>;
  }

  if (error) {
    return <div className="container mx-auto p-8"><p className="text-red-500">Erro: {error}</p></div>;
  }

  return (
    <div className="container mx-auto p-8">
      <h2 className="text-2xl font-bold mb-4">Dashboard de KPIs</h2>
      <div className="grid gap-4 md-grid-cols-2 lg:grid-cols-4">
        {/* PASSO 1: Removemos a anotação de tipo daqui */}
        {kpis && Object.entries(kpis).map(([title, value]) => (
          <Card key={title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{title}</CardTitle>
            </CardHeader>
            <CardContent>
              {/* PASSO 2: Adicionamos a "afirmação de tipo" (as string) aqui */}
              <div className="text-2xl font-bold">{value as string}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}