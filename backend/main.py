# backend/main.py

"""
Servidor FastAPI para a API de Análise Financeira.  
Este módulo define os endpoints para upload, normalização, cálculo de KPIs, gráficos,
consulta de dados normalizados e geração de relatórios textuais.
"""

# 1. Imports
from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid
import pandas as pd
from sqlalchemy import create_engine

# Nossos agentes
from agents.agente_ingestao import normalizar_dados
from agents.agente_analise_financeira import calcular_kpis
from agents.agente_visualizacao import preparar_dados_graficos  # <-- NOVO IMPORT

# 2. Cria a instância da aplicação FastAPI
app = FastAPI(
    title="API de Análise Financeira com IA",
    description="Uma API para processar planilhas financeiras e gerar relatórios com agentes de IA.",
    version="0.1.0",
)

# 3. Configuração do CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Constantes ---
DATA_PATH = "data"
os.makedirs(DATA_PATH, exist_ok=True)

# --- Banco de dados ---
# Utiliza um banco SQLite compartilhado entre os agentes para persistir as sessões
DATABASE_URL = "sqlite:///./backend/financeiro.db"
engine = create_engine(DATABASE_URL)

# 4. Endpoints básicos

@app.get("/health")
def health_check():
    """Endpoint de verificação de saúde da API."""
    return {"status": "ok"}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    """Recebe um arquivo CSV/XLSX e gera um `session_id` único para a sessão."""
    session_id = str(uuid.uuid4())
    file_extension = os.path.splitext(file.filename)[1]
    new_filename = f"{session_id}{file_extension}"
    save_path = os.path.join(DATA_PATH, new_filename)
    with open(save_path, "wb") as buffer:
        buffer.write(await file.read())
    return {"session_id": session_id, "filename": file.filename}


@app.get("/normalize/{session_id}")
async def normalize_data(session_id: str):
    """Normaliza os dados do arquivo associado à sessão e persiste no banco de dados."""
    found_file = None
    for filename in os.listdir(DATA_PATH):
        if filename.startswith(session_id):
            found_file = filename
            break
    if not found_file:
        raise HTTPException(status_code=404, detail="Sessão não encontrada.")
    filepath = os.path.join(DATA_PATH, found_file)
    try:
        linhas = normalizar_dados(filepath, session_id)
        return {"message": "Dados normalizados e salvos.", "linhas_processadas": linhas}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar arquivo: {str(e)}")


@app.get("/kpis/{session_id}")
async def get_kpis(session_id: str):
    """Calcula e retorna os KPIs financeiros para a sessão."""
    try:
        kpis = calcular_kpis(session_id)
        if "erro" in kpis:
            raise HTTPException(status_code=404, detail=kpis["erro"])
        return kpis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao calcular KPIs: {str(e)}")


@app.get("/charts/{session_id}")
async def get_chart_data(session_id: str):
    """Prepara e retorna os dados agregados para os gráficos da sessão."""
    try:
        chart_data = preparar_dados_graficos(session_id)
        if "erro" in chart_data:
            raise HTTPException(status_code=404, detail=chart_data["erro"])
        return chart_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao preparar dados para gráficos: {str(e)}")


# 5. Novo endpoint: retorno da tabela de dados normalizados
@app.get("/data/{session_id}")
async def get_data(session_id: str):
    """Retorna a planilha normalizada como uma lista de dicionários."""
    try:
        df = pd.read_sql_table(session_id, con=engine)
    except Exception:
        raise HTTPException(status_code=404, detail="Sessão não encontrada.")
    return df.to_dict(orient="records")


# 6. Novo endpoint: geração de relatório textual
@app.get("/report/{session_id}")
async def generate_report(session_id: str, topic: str | None = Query(None, description="Tema do relatório")):
    """
    Gera um relatório textual a partir dos dados da sessão.  
    Caso um `topic` seja fornecido, adiciona informações específicas sobre o tema (ex.: receitas, despesas ou categorias).
    """
    try:
        df = pd.read_sql_table(session_id, con=engine)
    except Exception:
        raise HTTPException(status_code=404, detail="Sessão não encontrada.")

    # Normaliza campos
    df['tipo'] = df['tipo'].str.strip()

    receita_total = df[df['tipo'] == 'Receita']['valor'].sum()
    despesa_total = df[df['tipo'] == 'Despesa']['valor'].sum()
    lucro_liquido = receita_total + despesa_total
    margem = (lucro_liquido / receita_total * 100) if receita_total != 0 else 0

    summary = (
        f"Receita total: R$ {receita_total:,.2f}. "
        f"Despesa total: R$ {abs(despesa_total):,.2f}. "
        f"Lucro líquido: R$ {lucro_liquido:,.2f}. "
        f"Margem de lucro: {margem:.2f}%."
    )

    if topic:
        topic_lower = topic.lower()
        # Relatório sobre categorias de despesa ou despesas em geral
        if 'categoria' in topic_lower or 'despesa' in topic_lower:
            despesas_df = df[df['tipo'] == 'Despesa'].copy()
            despesas_por_categoria = (
                despesas_df.groupby('categoria')['valor'].sum().abs()
                .sort_values(ascending=False)
                .head(5)
            )
            cat_report = "; ".join(
                [f"{cat}: R$ {val:,.2f}" for cat, val in despesas_por_categoria.items()]
            )
            summary += f" Maiores categorias de despesa: {cat_report}."
        # Relatório sobre receitas
        if 'receita' in topic_lower:
            receitas_df = df[df['tipo'] == 'Receita'].copy()
            receitas_por_categoria = (
                receitas_df.groupby('categoria')['valor'].sum()
                .sort_values(ascending=False)
                .head(5)
            )
            rec_report = "; ".join(
                [f"{cat}: R$ {val:,.2f}" for cat, val in receitas_por_categoria.items()]
            )
            summary += f" Maiores fontes de receita: {rec_report}."

    return {"report": summary}