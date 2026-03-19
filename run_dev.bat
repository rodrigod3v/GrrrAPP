@echo off
REM GrrrAPP Development Runner (Windows Batch - No PowerShell)
echo 🥋 Iniciando o ambiente de desenvolvimento do GrrrAPP...

SET ROOT=%~dp0
SET VENV_DIR=%ROOT%venv
SET VENV_PYTHON=%VENV_DIR%\Scripts\python.exe

REM --- Logic to find compatible Python (Quick check) ---
python --version >nul 2>&1 && set PY_CMD=python && GOTO FOUND_PY
python3 --version >nul 2>&1 && set PY_CMD=python3 && GOTO FOUND_PY

echo ❌ Python não encontrado. Certifique-se de que o Python está instalado e no seu PATH.
exit /b 1

:FOUND_PY
echo ✅ Usando: %PY_CMD%

REM --- Virtual Environment Setup ---
if not exist "%VENV_DIR%" (
    echo 📦 Criando venv...
    %PY_CMD% -m venv venv
)

REM --- Dependencies and Database ---
echo 🔌 Preparando Backend...
"%VENV_PYTHON%" -m pip install --upgrade pip
"%VENV_PYTHON%" -m pip install -r "%ROOT%backend\requirements.txt"

echo 🗄️ Validando banco de dados SQLite...
SET PYTHONPATH=%ROOT%
"%VENV_PYTHON%" -c "from backend.database import create_db_and_tables; create_db_and_tables()"

REM --- Frontend Setup ---
set FRONT_DIR=%ROOT%frontend
if exist "%FRONT_DIR%" (
    echo 📦 Preparando node_modules...
    if not exist "%FRONT_DIR%\node_modules" (
        cd /d "%FRONT_DIR%"
        npm install
    )
)

REM --- Parallel Startup ---
echo ========================================================
echo 🚀 API: http://127.0.0.1:8000/docs
echo 🚀 App: http://localhost:5173
echo ========================================================

cd /d "%ROOT%backend"
start "GrrrAPP Backend" "%VENV_PYTHON%" -m uvicorn main:app --reload

if exist "%FRONT_DIR%" (
    cd /d "%FRONT_DIR%"
    start "GrrrAPP Frontend" npm run dev
)

echo ✅ Serviços disparados!
pause
