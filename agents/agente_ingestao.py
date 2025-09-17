# agents/agente_ingestao.py

import pandas as pd
from sqlalchemy import create_engine

DATABASE_URL = "sqlite:///./backend/financeiro.db"
engine = create_engine(DATABASE_URL)

def converter_valor_brasileiro(valor_str):
    """
    Converte uma string de valor monetário brasileiro (ex: "1.234,56" ou "789.01")
    para um número float.
    """
    if not isinstance(valor_str, str):
        return None
    
    # Remove espaços em branco
    valor_str = valor_str.strip()
    
    # Se tem vírgula, assume que é o decimal e remove os pontos de milhar
    if ',' in valor_str:
        valor_str = valor_str.replace('.', '').replace(',', '.')
    # Se não tem vírgula, o ponto já é o decimal (se houver)
    
    try:
        return float(valor_str)
    except (ValueError, TypeError):
        return None

def normalizar_dados(filepath: str, session_id: str) -> int:
    """
    Lê um arquivo CSV, limpa os dados e os salva em uma tabela
    específica para a sessão no banco de dados SQLite.
    """
    try:
        # Força o uso do motor 'python' que é mais robusto
        df = pd.read_csv(filepath, sep=',', engine='python') # <-- MUDANÇA AQUI
    except UnicodeDecodeError:
        df = pd.read_csv(filepath, encoding='latin-1', sep=',', engine='python') # <-- E AQUI
        
    print("--- DADOS BRUTOS ---")
    print(df.head())

    # Garante que a coluna 'tipo' não tenha espaços extras
    if 'tipo' in df.columns:
        df['tipo'] = df['tipo'].str.strip()

    # Aplica a função de conversão inteligente na coluna 'valor'
    df['valor'] = df['valor'].apply(converter_valor_brasileiro)

    # Converte a coluna de data
    df['data'] = pd.to_datetime(df['data'], errors='coerce', dayfirst=True)
    
    # Corrige o sinal das despesas
    if 'tipo' in df.columns and 'valor' in df.columns:
        df.loc[(df['tipo'] == 'Despesa') & (df['valor'] > 0), 'valor'] *= -1

    # Remove duplicatas e linhas com dados essenciais nulos
    df = df.drop_duplicates()
    df = df.dropna(subset=['data', 'valor'])
    
    print(f"\n--- DADOS APÓS LIMPEZA (antes de salvar) ---")
    print(df.head())
    print(f"\nNúmero de linhas limpas: {len(df)}")


    df.to_sql(name=session_id, con=engine, if_exists='replace', index=False)
    
    return len(df)