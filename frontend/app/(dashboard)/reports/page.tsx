// Página de relatórios: permite ao usuário solicitar um relatório textual sobre um tema específico.  
// Utiliza a API do backend para gerar relatórios e exibe o resultado ao usuário.

'use client';

import { useState } from 'react';
import { useAnalysisStore } from '@/store/analysisStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ReportsPage() {
  const { sessionId, report, isLoading, error, generateReport } = useAnalysisStore();
  const [topic, setTopic] = useState('');

  const handleGenerate = async () => {
    if (!topic) return;
    await generateReport(topic);
  };

  if (!sessionId) {
    return <p className="p-4">Por favor, faça o upload de um arquivo primeiro na página de Upload.</p>;
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <h2 className="text-2xl font-bold mb-4">Gerar Relatório</h2>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Selecione um Tema</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-2">Digite um assunto ou pergunta para o qual deseja gerar um relatório.</p>
          <div className="flex space-x-2">
            <Input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex.: Análise de Receitas"
              className="flex-grow"
            />
            <Button onClick={handleGenerate} disabled={isLoading || !topic}>
              {isLoading ? 'Gerando...' : 'Gerar'}
            </Button>
          </div>
        </CardContent>
      </Card>
      {error && <p className="p-4 text-red-500">Erro: {error}</p>}
      {report && (
        <Card>
          <CardHeader>
            <CardTitle>Relatório</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap">{report}</pre>
          </CardContent>
        </Card>
      )}
    </div>
  );
}