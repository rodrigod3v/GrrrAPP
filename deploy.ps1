# GrrrAPP Deployment Script
# Usage: .\deploy.ps1 <VM_USER>@<VM_IP>

param (
    [Parameter(Mandatory=$true)]
    [string]$Target
)

$KEY_PATH = "C:\Users\777\Documents\.conti\ssh-key-2026-01-26.key"
$REMOTE_PATH = "~/grrrapp"

Write-Host "Iniciando deploy para $Target..." -ForegroundColor Cyan

# 1. Create remote directory if not exists
ssh -i $KEY_PATH $Target "mkdir -p $REMOTE_PATH"

# 2. Upload Backend & Database
Write-Host "Enviando arquivos (backend/ e grrrapp.db)..."
scp -i $KEY_PATH -r backend/ grrrapp.db "${Target}:${REMOTE_PATH}/"

Write-Host "Deploy concluído com sucesso!" -ForegroundColor Green
Write-Host "Para rodar na VM execute:"
Write-Host "uvicorn backend.main:app --host 0.0.0.0 --port 8000" -ForegroundColor Yellow
