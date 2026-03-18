#!/bin/bash
# GrrrAPP Development Runner Script (Full Stack)

echo "🥋 Iniciando o ambiente de desenvolvimento completo do GrrrAPP..."

# Função para matar processos filhos no encerramento com Ctrl+C
cleanup() {
    echo ""
    echo "🛑 Encerrando os servidores do GrrrAPP..."
    kill $(jobs -p) 2>/dev/null
    exit
}
trap cleanup SIGINT SIGTERM

# ================= BACKEND =================
# O Python 3.13 e 3.14 tem conflito de compilação local no Mac com o Pydantic-core (Rust/PyO3)
# Vamos buscar automaticamente a versão 3.12, 3.11 ou 3.10 na máquina!
PYTHON_CMD=""
for py in python3.12 python3.11 python3.10 python3.9; do
    if command -v $py &> /dev/null; then
        PYTHON_CMD=$py
        break
    fi
done

if [ -z "$PYTHON_CMD" ]; then
    echo "❌ Nenhuma versão compatível do Python 3 (3.9 a 3.12) foi encontrada!"
    echo "⚠️ A sua versão instalada do Python (3.14) é nova demais e quebra o FastAPI."
    echo "👉 Pare o script e instale o Python 3.12 rodando no terminal: brew install python@3.12"
    exit 1
fi

echo "✅ Usando a versão compatível encontrada: $PYTHON_CMD"

# Se o venv atual estiver no Python problemático (3.13 ou 3.14), vamos deletar e recriar
if [ -d "venv" ]; then
    VENV_VER=$(venv/bin/python --version 2>&1)
    if [[ "$VENV_VER" == *"3.13"* ]] || [[ "$VENV_VER" == *"3.14"* ]]; then
        echo "⚠️ $VENV_VER detectado no venv atual. Excluindo e recriando com o $PYTHON_CMD..."
        rm -rf venv
    fi
fi

# Cria o ambiente virtual se não existir
if [ ! -d "venv" ]; then
    echo "📦 Criando ambiente virtual compatível..."
    $PYTHON_CMD -m venv venv
fi

# Ativa o ambiente virtual
echo "🔌 Ativando ambiente virtual do Backend..."
source venv/bin/activate

# Instala as dependências
echo "📥 Instalando dependências do projeto Python..."
pip install --upgrade pip
pip install -r backend/requirements.txt

# Valida as tabelas do SQLite e inicia o DB
echo "🗄️ Validando banco de dados SQLite (WAL Mode)..."
export PYTHONPATH=$PYTHONPATH:$(pwd)
python3 -c "from backend.database import create_db_and_tables; create_db_and_tables()"

# ================= FRONTEND =================
# Instala as dependências se a pasta do front existir
if [ -d "frontend" ]; then
    echo "📦 Checando dependências do Frontend (NodeJS)..."
    cd frontend
    if [ ! -d "node_modules" ]; then
        npm install
    fi
    cd ..
fi

echo ""
echo "========================================================"
echo "🚀 Iniciando API na porta 8000 (com Auto-Reload no terminal)..."
echo "👉 Endpoints (Swagger): http://127.0.0.1:8000/docs"
uvicorn backend.main:app --reload &

if [ -d "frontend" ]; then
    echo "🌐 Iniciando Painel Web (Vite React)..."
    echo "👉 App rodando em: http://localhost:5173"
    cd frontend && npm run dev &
fi

echo "========================================================"
echo "✅ Todos os serviços estão rodando em paralelo! Pressione [CTRL+C] uma vez para derrubar tudo simultaneamente."
# Segura o script rodando e exibe logs
wait
