 
# agents/agente_visualizacao.py

import pandas as pd
from sqlalchemy import create_engine

# Aponta para o mesmo banco de dados que os outros agentes
DATABASE_URL = "sqlite:///./backend/financeiro.db"
engine = create_engine(DATABASE_URL)

def preparar_dados_graficos(session_id: str) -> dict:
    """
    Lê os dados de uma sessão do banco de dados e prepara agregações
    para os gráficos do dashboard.
    """
    try:
        df = pd.read_sql_table(session_id, con=engine)
    except Exception as e:
        return {"erro": f"Dados da sessão não encontrados ou corrompidos: {e}"}

    # Garante que a coluna 'data' seja do tipo datetime
    df['data'] = pd.to_datetime(df['data'])

    # --- Gráfico 1: Despesas por Categoria ---
    despesas_df = df[df['tipo'] == 'Despesa'].copy()
    # Usamos o valor absoluto para o gráfico (barras positivas)
    despesas_por_categoria = despesas_df.groupby('categoria')['valor'].sum().abs().sort_values(ascending=False)
    
    grafico_despesas_categoria = {
        "labels": despesas_por_categoria.index.tolist(),
        "values": despesas_por_categoria.values.tolist()
    }

    # --- Gráfico 2: Fluxo Mensal (Receitas vs Despesas) ---
    # Garante que as colunas existam antes de agrupar
    if not all(col in df.columns for col in ['data', 'tipo', 'valor']):
        return {"erro": "Colunas necessárias (data, tipo, valor) não encontradas."}

    # Extrai o mês (ex: '2024-01') de cada transação para agrupar
    df['mes'] = df['data'].dt.to_period('M').astype(str)
    
    # Agrupa por mês e tipo, soma os valores, e "pivota" a tabela
    fluxo_mensal = df.groupby(['mes', 'tipo'])['valor'].sum().unstack(fill_value=0)

    # Garante que as colunas Receita e Despesa existam após o pivot
    if 'Receita' not in fluxo_mensal.columns:
        fluxo_mensal['Receita'] = 0
    if 'Despesa' not in fluxo_mensal.columns:
        fluxo_mensal['Despesa'] = 0
    
    grafico_fluxo_mensal = {
        "meses": fluxo_mensal.index.tolist(),
        "receitas": fluxo_mensal['Receita'].tolist(),
        "despesas": fluxo_mensal['Despesa'].tolist() # Valores já negativos
    }

    return {
        "despesas_categoria": grafico_despesas_categoria,
        "fluxo_mensal": grafico_fluxo_mensal
    }