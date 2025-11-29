# 🧰 Pipefy Phase Card Updater

Script em Node.js para:

- Buscar **todos os cards** de uma fase específica no Pipefy (com paginação automática via GraphQL)
- Extrair **todos os IDs** desses cards
- **Atualizar um campo específico** em **todos os cards** dessa fase

Ideal para tarefas de manutenção em massa, correções de dados ou testes de automação com a API do Pipefy.

---

## 🔧 Tecnologias utilizadas

- Node.js (recomendado **18+**, pelo fetch nativo)
- ES Modules (`"type": "module"` no `package.json`)
- Pipefy GraphQL API
- dotenv (para variáveis de ambiente)

---

## 📁 Estrutura do projeto

```
.
├── config
│   └── config.js              # Carrega o .env e valida o token
├── src
│   └── FindAndUpdateFields.js # Lógica de busca, paginação e atualização
├── index.js                   # Entrypoint principal
├── .env                       # Contém o TOKEN_PIPEFY (não versionar)
├── package.json
└── package-lock.json
```

---

## ⚙️ Configuração

### 1. Instalar dependências

```
npm install dotenv
```

### 2. Configurar o `package.json`

```json
{
  "type": "module",
  "scripts": {
    "start": "node index.js"
  }
}
```

### 3. Criar o arquivo `.env`

```
TOKEN_PIPEFY=SEU_TOKEN_AQUI
```

---

## 🧩 Arquivo `config/config.js`

```js
import dotenv from "dotenv";

dotenv.config();

const PipefyToken = process.env.TOKEN_PIPEFY;

if (!PipefyToken) {
  throw new Error("A variável (TOKEN_PIPEFY) não foi definida no arquivo .env");
}

export default {
  pipefy: {
    token: PipefyToken
  }
};
```

---

## 🧠 Arquivo `src/FindAndUpdateFields.js`

Este arquivo contém a lógica completa:

- Busca página de cards (`fetchCardsPageByPhase`)
- Paginação completa (`getAllCardsFromPhase`)
- Extração apenas dos IDs (`getAllCardIdsFromPhase`)
- Atualização individual (`updateCardPipefy`)
- Atualização em massa (`updateFieldByCard`)

---

## 🚀 Arquivo `index.js` (Entrypoint)

```js
import { updateFieldByCard } from "./src/FindAndUpdateFields.js";

const phaseId = "340952537";
const fieldId = "c_digo_cidade";
const newValue = "teste123";

async function main() {
  try {
    console.log("🚀 Iniciando atualização dos cards...");

    await updateFieldByCard(phaseId, 50, fieldId, newValue);

    console.log("✅ Processo finalizado com sucesso.");
  } catch (error) {
    console.error("❌ Erro ao executar:", error.message);
  }
}

main();
```

---

## ▶️ Como executar

```
npm start
# ou
node index.js
```

---

## 📌 Observações importantes

- `fieldId` deve ser o **field_id real** do Pipefy.
- `newValue` deve ser uma string.
- Paginação usa `endCursor` e `hasNextPage`.
- Atualizações são feitas sequencialmente.

---

## 🧪 Melhorias futuras

- Execução paralela com limite
- Retry automático
- CLI com parâmetros
- Relatórios finais em JSON
- Suporte a múltiplos campos

---

## 📄 Licença

Uso livre para estudos e projetos internos.
