# GrrrAPP Development Runner (Windows PowerShell) #
# Starts both Backend (FastAPI) and Frontend (Vite) #

$ErrorActionPreference = "Stop"

Write-Host "Iniciando o ambiente de desenvolvimento do GrrrAPP..."

$ROOT = Get-Location
$VENV_DIR = Join-Path $ROOT "venv"
$VENV_PYTHON = Join-Path $VENV_DIR "Scripts\python.exe"

# --- Logic to find compatible Python (3.9 - 3.12) --- #
$PY_NAMES = @("python3.12", "python3.11", "python3.10", "python3.9", "python", "py")
$PY_CMD = $null

foreach ($n in $PY_NAMES) {
    if (Get-Command $n -ErrorAction SilentlyContinue) {
        $v = & $n --version 2>&1
        if ($v -match "3\.(9|10|11|12|13|14)") {
            $PY_CMD = $n
            break
        }
    }
}

if ($null -eq $PY_CMD) {
    Write-Warning "Nenhuma versão do Python 3 foi encontrada no seu PATH. Tentando apenas 'python'..."
    $PY_CMD = "python"
}

# --- Virtual Environment Setup --- #
if (-not (Test-Path $VENV_DIR)) {
    Write-Host "Criando venv..."
    & $PY_CMD -m venv venv
}

# --- Dependencies and Database --- #
Write-Host "Preparando dependências..."
& $VENV_PYTHON -m pip install --upgrade pip
$backend_reqs = Join-Path $ROOT "backend\requirements.txt"
& $VENV_PYTHON -m pip install -r $backend_reqs

Write-Host "Pre-inicializando DB..."
$env:PYTHONPATH = $ROOT.Path
$py_script = "from backend.database import create_db_and_tables; create_db_and_tables()"
& $VENV_PYTHON -c $py_script

# --- Frontend Setup --- #
$FRONT_DIR = Join-Path $ROOT "frontend"
if (Test-Path $FRONT_DIR) {
    Write-Host "Preparando node_modules..."
    if (-not (Test-Path (Join-Path $FRONT_DIR "node_modules"))) {
        Push-Location $FRONT_DIR
        npm install
        Pop-Location
    }
}

# --- Parallel Startup --- #
Write-Host "`n🚀 API: http://127.0.0.1:8000/docs"
Write-Host "🚀 App: http://localhost:5173`n"

$B_CMD = "cd '$ROOT\backend'; & '$VENV_PYTHON' -m uvicorn main:app --reload"
Start-Process powershell -ArgumentList "-NoExit", "-Command", $B_CMD

if (Test-Path $FRONT_DIR) {
    $F_CMD = "cd '$FRONT_DIR'; npm run dev"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $F_CMD
}

Write-Host "Concluído. Pressione qualquer tecla para sair."
$null = [Console]::ReadKey($true)
