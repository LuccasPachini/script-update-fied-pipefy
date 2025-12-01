# 🧰 Pipefy Phase Card Updater

Script em Node.js para:

- Buscar **todos os cards** de uma fase específica no Pipefy (com paginação automática via GraphQL)
- Extrair **todos os IDs** desses cards
- **Atualizar um campo específico** em **todos os cards** dessa fase

Ideal para tarefas de manutenção em massa, correções de dados ou testes de automação com a API do Pipefy.

## 🎯 Objetivo do Projeto

Este projeto foi criado para resolver um problema real de operação envolvendo a atualização em massa de cards dentro de um Pipe no Pipefy.

### 🔎 Contexto
Dentro do processo utilizado, existe um campo específico em cada card que, ao ser atualizado, **aciona um fluxo automatizado na Workato**.  
Esse fluxo é baseado em um *trigger* que monitora alterações no valor desse campo.

Como a fase alvo contém **mais de 250 cards**, atualizar esse campo manualmente em cada card seria inviável, demorado e suscetível a erros humanos.

### 💡 Solução Desenvolvida
Este script automatiza toda a operação:

1. **Busca todos os cards da fase desejada**, usando paginação GraphQL para garantir que todos os registros sejam obtidos (mesmo acima do limite de 50 por página do Pipefy).
2. **Extrai os IDs de todos os cards** da fase.
3. **Atualiza o campo configurado** em cada card — o que aciona imediatamente o fluxo da Workato.
4. Faz isso de forma **sequencial**, segura e monitorada por logs, garantindo que cada atualização seja confirmada.

### ⚙️ Benefícios da Automação
- Elimina necessidade de edição manual card por card.
- Garante total rastreabilidade via logs.
- Evita falhas humanas na operação.
- Permite disparar o fluxo da Workato de forma controlada.
- Reduz horas de trabalho para poucos segundos/minutos.
- Escalável: funciona para 10 cards ou para 10.000 cards.

### 🚀 Quando usar este script?
- Sempre que for necessário **forçar o disparo do fluxo Workato** em lote.
- Quando um campo mudar de regra e precisar ser corrigido em todos os cards.
- Quando houver necessidade de disparar uma revalidação, reconciliação ou nova automação.
- Durante correções de massa, limpeza de dados ou ajustes de processo.

---

## 🔧 Tecnologias utilizadas

- Node.js (recomendado **18+**, pelo fetch nativo)
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

## 📄 Licença

Uso livre para estudos e projetos internos.
