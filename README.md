# GrrrAPP MVP 🥋

Bem-vindo ao repositório do **GrrrAPP**! Este é o backend e infraestrutura para um sistema SaaS (Software as a Service) voltado para o gerenciamento de academias de artes marciais (Jiu-Jitsu, Muay Thai, Wrestling, etc.).

A arquitetura foi pensada para ser **Lean (Enxuta)**, possibilitando rodar toda a aplicação e o banco de dados confortavelmente em uma **Máquina Virtual (VM) da Oracle Cloud com 1GB de RAM**.

---

## 🏗️ Arquitetura do Sistema

### 1. Backend (API)
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python) - *Leve, rápido e nativamente assíncrono.*
- **Banco de Dados:** SQLite em **Modo WAL** *(Write-Ahead Logging)*.
  - **Motivo:** O PostgreSQL consome em média 200MB-300MB apenas para ligar. O SQLite utiliza de 0 a 5MB de RAM fixos, sendo perfeito para servidores com baixa memória, enquanto o WAL garante segurança para salvar os dados em disco sem que as consultas (leitura e escrita concomitantes) concorram entre si.
- **Gerenciador de Modelos ORM:** [SQLModel](https://sqlmodel.tiangolo.com/) (suportado pelo SQLAlchemy e Pydantic).

### 2. Infraestrutura (VM 1GB RAM)
- **Swap (Memória Virtual):** Arquivo de paginação (Swap) configurado para **2GB**, impedindo que a aplicação trave ou morra (OOM Killed) durante picos de processos.
- **Process Manager:** [PM2](https://pm2.keymetrics.io/) com apenas `1 Uvicorn Worker` configurado para não sobrecarregar a memória, mantendo reinicializações automáticas caso passem de `400MB`.
- **Servidor Web e Proxy:** Nginx. Ele envia as rotas `/api/` para a API do FastAPI (Porta 8000) e todo o restante para um build estático que será construído na raiz `/` usando Vite (React ou VueJS).

---

## 🗄️ Estrutura do Projeto

O diretório está dividido da seguinte forma:

```text
GrrrAPP/
├── backend/                  # Todo o código-fonte da API Python
│   ├── main.py               # Rotas e ponto de entrada da nossa API (Endpoints)
│   ├── database.py           # Conexão customizada com o SQLite (WAL)
│   ├── models.py             # Schema/Tabelas baseadas em SQLModel
│   └── requirements.txt      # Dependências (FastAPI, Uvicorn, SQLModel, etc.)
│
├── infra/                    # Scripts de otimização e deploy do servidor Oracle
│   ├── setup_swap.sh         # Script bash pra ativação dos 2GB de Swap da VM
│   ├── nginx.conf            # Configuração do Proxy Reverso + Servidor Estático
│   └── ecosystem.config.js   # Script para o PM2 garantir que o Uvicorn não estoure a memória
│
└── README.md                 # Esta documentação!
```

---

## 💾 Banco de Dados (Schemas)

O sistema possui 4 Módulos principais mapeados no arquivo `models.py`:

1. **Módulo de Alunos (`Student`)**
   - Campos: `Nome`, `E-mail`, `Foto (URL)`, `Faixa (Ex: Branca, Azul`, `Roxa)`, `Grau (0-4)` e `Status de Atividade`.
2. **Agenda de Treinos (`ScheduledClass`)**
   - Campos: `Modalidade (BJJ, Muay Thai)`, `Dia da Semana`, `Horário Início e Fim`, `Capacidade da turma`.
3. **Módulo Financeiro (`Payment`)**
   - Preparado para mock de gateway (Asaas/Stripe).
   - Campos: `Valor`, `Vencimento`, `Status (Pending, Paid)`, `Método (Pix/Boleto)`, `Referência Gateway`, `Chave Pix Copia e Cola`.
4. **Módulo de Check-in Inteligente (`Attendance`)**
   - Campos: `ID do Aluno`, `ID do Treino`, `Data e Hora` e a validação do `Token Seguro de QR Code`.

---

## 🚀 Como Executar o Backend Localmente

*🚨 **Atenção:** Se possível, utilize o Python 3.10, 3.11 ou 3.12 (A versão 3.14 atual do MacOS pode entrar em conflitos de compilação com algumas bibliotecas).*

1. Navegue até a pasta do projeto:
   ```bash
   cd /Users/rodrigoorlandoqa/Documents/GrrrAPP
   ```

2. Crie e ative o Ambiente Virtual:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Instale as dependências:
   ```bash
   pip install -r backend/requirements.txt
   ```

4. Execute o Servidor Backend:
   ```bash
   uvicorn backend.main:app --reload
   ```

5. O Banco SQLite (`grrrapp.db`) será criado automaticamente! Acesse o Swagger interativo local em:
   👉 **http://127.0.0.1:8000/docs**

---

## 🌐 Como Fazer o Setup na Nuvem da Oracle (Produção)

No seu terminal de acesso à VM Oracle Cloud Ubuntu Linux (ou semelhantes), siga os passos em ordem:

### Otimizando a Memória RAM (Swap)
Libere o script fornecido para otimizar a sua VM para não travar:
```bash
sudo bash infra/setup_swap.sh
```
*Ele rodará um log customizado alterando a `swappiness` para uso balanceado da RAM do Python.*

### Rotas e Nginx
Instale o nginx e mova ou referencie nosso arquivo:
```bash
sudo apt update && sudo apt install nginx -y
sudo cp infra/nginx.conf /etc/nginx/sites-available/grrrapp
sudo ln -s /etc/nginx/sites-available/grrrapp /etc/nginx/sites-enabled/
sudo systemctl restart nginx
```

### Configurando PM2 e Processos da API
Instale o PM2 como daemon permanente de processos do FastAPI:
```bash
# Caso não tenha npm ou NodeJS instalado na VM, rode:
# curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - && sudo apt-get install -y nodejs

sudo npm install pm2 -g
pm2 start infra/ecosystem.config.js
pm2 save
pm2 startup
```

Pronto! Seu servidor Linux da Oracle estará balanceado e processando todos os endpoints com velocidade altíssima e estabilidade garantida! 🦖
