// Página de upload: permite selecionar e enviar uma planilha financeira.  
// Após o envio e normalização, redireciona o usuário para a página de KPIs.

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAnalysisStore } from '@/store/analysisStore';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const setSessionId = useAnalysisStore((state) => state.setSessionId);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
      setMessage('');
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) {
      setMessage('Por favor, selecione um arquivo antes de enviar.');
      return;
    }
    setIsLoading(true);
    setMessage('Enviando e processando arquivo...');
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Realiza o upload do arquivo no backend
      const uploadResponse = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });
      if (!uploadResponse.ok) throw new Error('Falha no upload.');
      const uploadResult = await uploadResponse.json();

      // Solicita a normalização dos dados usando o ID de sessão retornado
      const normalizeResponse = await fetch(`http://localhost:8000/normalize/${uploadResult.session_id}`);
      if (!normalizeResponse.ok) throw new Error('Falha na normalização dos dados.');

      // Atualiza a store com o ID de sessão e navega para a página de KPIs
      setSessionId(uploadResult.session_id);
      router.push('/kpis');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erro desconhecido';
      setMessage(`Erro: ${msg}. Verifique o console.`);
      console.error('Erro no processo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-lg py-12">
      <Card>
        <CardHeader>
          <CardTitle>Relatórios Financeiros com IA</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Faça o upload da sua planilha de finanças (.csv ou .xlsx) para iniciar a análise.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input type="file" accept=".csv, .xlsx" onChange={handleFileChange} />
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Processando...' : 'Analisar Planilha'}
            </Button>
          </form>
          {message && <p className="mt-4 text-sm">{message}</p>}
        </CardContent>
      </Card>
    </div>
  );
}