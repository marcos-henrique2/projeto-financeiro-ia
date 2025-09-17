# agents/agente_analise_financeira.py

import pandas as pd
from sqlalchemy import create_engine

DATABASE_URL = "sqlite:///./backend/financeiro.db"
engine = create_engine(DATABASE_URL)

def calcular_kpis(session_id: str) -> dict:
    """
    Lê os dados de uma sessão do banco de dados e calcula os KPIs financeiros.
    """
    try:
        df = pd.read_sql_table(session_id, con=engine)
    except Exception as e:
        return {"erro": f"Dados da sessão não encontrados ou corrompidos: {e}"}

    # Garante que a coluna 'tipo' não tenha espaços extras antes de filtrar
    df['tipo'] = df['tipo'].str.strip()

    receita_total = df[df['tipo'] == 'Receita']['valor'].sum()
    despesa_total = df[df['tipo'] == 'Despesa']['valor'].sum()
    lucro_liquido = receita_total + despesa_total

    margem_lucro = (lucro_liquido / receita_total) * 100 if receita_total != 0 else 0
    
    kpis = {
        "Receita Total": f"R$ {receita_total:,.2f}",
        "Despesa Total": f"R$ {despesa_total:,.2f}",
        "Lucro Líquido": f"R$ {lucro_liquido:,.2f}",
        "Margem de Lucro": f"{margem_lucro:.2f}%"
    }

    return kpis