# GrrrAPP Terminal Runner
# Starts both Backend and Frontend in the current terminal window

$ROOT = Get-Location
$VENV_PYTHON = Join-Path $ROOT "venv\Scripts\python.exe"
$FRONT_DIR = Join-Path $ROOT "frontend"

Write-Host "Iniciando GrrrAPP no terminal..."

# Backend command runs from ROOT to correctly find the 'backend' package
$BACKEND_CMD = "`"$VENV_PYTHON`" -m uvicorn backend.main:app --reload"

# Frontend command needs to cd into the frontend directory
$FRONTEND_CMD = "cd frontend && npm run dev"

# Run concurrently using npx (shell-agnostic paths)
npx -y concurrently -n "API,APP" -c "blue,green" "$BACKEND_CMD" "$FRONTEND_CMD"
