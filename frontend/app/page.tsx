// Página inicial do projeto financeiro.  
// Apresenta uma breve descrição e um botão para iniciar a análise através do upload de planilha.

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="container mx-auto py-12 flex flex-col items-center justify-center text-center">
      <h1 className="text-4xl font-extrabold mb-4">Projeto Financeiro IA</h1>
      <p className="text-lg mb-6 max-w-2xl">
        Analise suas finanças pessoais de forma inteligente. Carregue sua planilha de receitas e despesas
        e receba indicadores de desempenho e gráficos interativos gerados por Inteligência Artificial.
      </p>
      <Link href="/upload">
        <Button className="px-6 py-3 text-lg">Analisar minha planilha</Button>
      </Link>
    </div>
  );
}