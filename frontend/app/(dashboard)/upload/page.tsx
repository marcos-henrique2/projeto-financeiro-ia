// frontend/app/(dashboard)/upload/page.tsx

'use client'; 

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Importa o hook de navegação
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAnalysisStore } from '@/store/analysisStore'; // Importa nosso store

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter(); // Inicializa o roteador
  const setSessionId = useAnalysisStore((state) => state.setSessionId); // Pega a ação do store

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
      setMessage('');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      setMessage('Por favor, selecione um arquivo antes de enviar.');
      return;
    }
    setIsLoading(true);
    setMessage('Enviando e processando arquivo...');
    
    // PASSO 1: Upload
    const formData = new FormData();
    formData.append('file', file);
    try {
      const uploadResponse = await fetch('http://localhost:8000/upload', {
        method: 'POST',
        body: formData,
      });
      if (!uploadResponse.ok) throw new Error('Falha no upload.');
      const uploadResult = await uploadResponse.json();
      
      // PASSO 2: Normalização
      const normalizeResponse = await fetch(`http://localhost:8000/normalize/${uploadResult.session_id}`);
      if (!normalizeResponse.ok) throw new Error('Falha na normalização dos dados.');
      
      // SUCESSO! Salva o ID no store e navega para a página de KPIs
      setSessionId(uploadResult.session_id);
      router.push('/kpis');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      setMessage(`Erro: ${errorMessage}. Verifique o console.`);
      console.error('Erro no processo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // O JSX (return) permanece o mesmo
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Relatórios Financeiros com IA</h1>
      <p className="mb-4 text-gray-600">
        Faça o upload da sua planilha de finanças (.csv ou .xlsx) para iniciar a análise.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        <Input type="file" onChange={handleFileChange} accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" className="file:text-blue-700 hover:file:bg-blue-100" />
        <Button type="submit" disabled={isLoading}>{isLoading ? 'Processando...' : 'Analisar Planilha'}</Button>
      </form>
      {message && <p className="mt-4 text-sm font-medium text-gray-800 p-4 bg-gray-100 rounded-md">{message}</p>}
    </div>
  );
}