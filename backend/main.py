# backend/main.py

# 1. Imports
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid
# Nossos agentes
from agents.agente_ingestao import normalizar_dados
from agents.agente_analise_financeira import calcular_kpis
from agents.agente_visualizacao import preparar_dados_graficos # <-- NOVO IMPORT

# 2. Cria a instância da aplicação FastAPI
app = FastAPI(
    title="API de Análise Financeira com IA",
    description="Uma API para processar planilhas financeiras e gerar relatórios com agentes de IA.",
    version="0.1.0"
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


# 4. Endpoints... (health, upload, normalize, kpis permanecem os mesmos)

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    session_id = str(uuid.uuid4())
    file_extension = os.path.splitext(file.filename)[1]
    new_filename = f"{session_id}{file_extension}"
    save_path = os.path.join(DATA_PATH, new_filename)
    with open(save_path, "wb") as buffer:
        buffer.write(await file.read())
    return {"session_id": session_id, "filename": file.filename}

@app.get("/normalize/{session_id}")
async def normalize_data(session_id: str):
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
    try:
        kpis = calcular_kpis(session_id)
        if "erro" in kpis:
            raise HTTPException(status_code=404, detail=kpis["erro"])
        return kpis
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao calcular KPIs: {str(e)}")

# 8. Endpoint de Dados para Gráficos (NOVO)
@app.get("/charts/{session_id}")
async def get_chart_data(session_id: str):
    """
    Dispara o Agente de Visualização para preparar os dados para os gráficos.
    """
    try:
        chart_data = preparar_dados_graficos(session_id)
        if "erro" in chart_data:
            raise HTTPException(status_code=404, detail=chart_data["erro"])
        return chart_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao preparar dados para gráficos: {str(e)}")