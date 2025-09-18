// Página de dados normalizados: exibe a planilha enviada em formato tabular.  
// Os dados são obtidos do backend através da store.

'use client';

import { useEffect } from 'react';
import { useAnalysisStore } from '@/store/analysisStore';

export default function DataPage() {
  const { sessionId, data, isLoading, error, fetchData } = useAnalysisStore();

  useEffect(() => {
    if (sessionId && !data) {
      fetchData();
    }
  }, [sessionId, data, fetchData]);

  if (!sessionId) {
    return <p className="p-4">Por favor, faça o upload de um arquivo primeiro na página de Upload.</p>;
  }

  if (isLoading) {
    return <p className="p-4">Carregando dados...</p>;
  }

  if (error) {
    return <p className="p-4 text-red-500">Erro: {error}</p>;
  }

  if (!data || data.length === 0) {
    return <p className="p-4">Nenhum dado disponível.</p>;
  }

  // Determina as colunas com base na primeira linha de dados
  const columns = Object.keys(data[0]);

  return (
    <div className="py-8">
      <h2 className="text-2xl font-bold mb-4">Dados Normalizados</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-2 py-1 font-semibold text-left">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row: any, index: number) => (
              <tr key={index} className="border-b">
                {columns.map((col) => (
                  <td key={col} className="px-2 py-1">
                    {String(row[col] ?? '')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}