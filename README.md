# Front-TREKO-G-Estoque
Repositório do Front-End de um projeto de sistema para gestão de estoque.

## Conexão com o Back-end / CORS

Este front usa chamadas HTTP para um back-end separado. Para evitar erros de CORS, o servidor deve permitir requisições do domínio onde a aplicação roda. Exemplos de cabeçalhos que o servidor deve enviar nas respostas:

- `Access-Control-Allow-Origin: http://localhost:5173` (ou `*` para desenvolvimento)
- `Access-Control-Allow-Credentials: true` (se for usar cookies ou autenticação baseada em sessão)
- `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
- `Access-Control-Allow-Headers: Content-Type, Authorization`

Se você estiver usando Express (Node.js) um exemplo simples:

```js
// usando o pacote cors
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
```

Variável de ambiente Vite:

- `VITE_API_BASE` — URL base do back-end (p.ex. `http://localhost:3000`). Defina em um arquivo `.env` na raiz do diretório `Front--------GEstoque`:

```
VITE_API_BASE=http://localhost:3000
```

Como o front foi configurado para incluir credenciais por padrão nas requisições (`credentials: 'include'`), certifique-se de ativar `credentials` no servidor e permitir a origem correta.

## Rodando o front (PowerShell)

No Windows PowerShell, na pasta `Front--------GEstoque`, rode:

```powershell
# instalar dependências
npm install

# rodar em modo dev (Vite)
npm run dev
```

Por padrão o Vite roda em `http://localhost:5173`. Se o seu back-end estiver em `http://localhost:3000` (padrão neste projeto), a variável `VITE_API_BASE` já aponta para esse endereço.

