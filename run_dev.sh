#!/bin/bash
# GrrrAPP Development Runner Script

echo "🥋 Iniciando o ambiente de desenvolvimento do GrrrAPP..."

# Verifica se o Python 3 está instalado
if ! command -v python3 &> /dev/null
then
    echo "❌ Python 3 não encontrado! Instale-o antes de continuar."
    exit 1
fi

# Cria o ambiente virtual se não existir
if [ ! -d "venv" ]; then
    echo "📦 Criando ambiente virtual..."
    python3 -m venv venv
fi

# Ativa o ambiente virtual
echo "🔌 Ativando ambiente virtual..."
source venv/bin/activate

# Instala as dependências
echo "📥 Instalando/Atualizando dependências..."
pip install --upgrade pip
pip install -r backend/requirements.txt

# Valida as tabelas do SQLite e inicia o DB
echo "🗄️ Validando banco de dados SQLite (WAL Mode)..."
export PYTHONPATH=$PYTHONPATH:$(pwd)
python -c "from backend.database import create_db_and_tables; create_db_and_tables()"

# Inicia o servidor uvicorn
echo "🚀 Iniciando API na porta 8000 (com Auto-Reload)..."
echo "👉 Acesse os Endpoints (Swagger) em: http://127.0.0.1:8000/docs"
uvicorn backend.main:app --reload
