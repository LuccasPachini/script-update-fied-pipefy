// Importa o objeto de configuração central (onde está o token do Pipefy)
import config from "../config/config.js";

// Token do Pipefy já validado no config.js
const pipefyToken = config.pipefy.token;

// Endpoint da API GraphQL do Pipefy
const PIPEFY_API_URL = "https://api.pipefy.com/graphql";

/**
 * Busca uma única página de cards de uma fase do Pipefy.
 * Essa função não cuida de paginação completa, apenas de uma chamada.
 */
export async function fetchCardsPageByPhase(phaseId, cursor = null, pageSize = 50) {
  const query = `
    query GetPhaseCards($phaseId: ID!, $first: Int!, $after: String) {
      phase(id: $phaseId) {
        id
        name
        cards(first: $first, after: $after) {
          edges {
            node {
              id
              title
              created_at
              updated_at
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  `;

  const variables = {
    phaseId,
    first: pageSize,
    after: cursor
  };

  const requestBody = {
    query,
    variables
  };

  const response = await fetch(PIPEFY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${pipefyToken}`
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error(
      `Erro ao chamar API do Pipefy. Status: ${response.status} - ${response.statusText}`
    );
  }

  const responseBody = await response.json();

  if (responseBody.errors && responseBody.errors.length > 0) {
    console.error("Erros retornados pelo Pipefy:", responseBody.errors);
    throw new Error("A API do Pipefy retornou erros na consulta GraphQL.");
  }

  const phaseData = responseBody.data?.phase;

  if (!phaseData) {
    throw new Error("A resposta do Pipefy não retornou dados da fase. Verifique o phaseId.");
  }

  const cardsConnection = phaseData.cards;
  const edges = cardsConnection.edges || [];
  const cards = edges.map((edge) => edge.node);

  const pageInfo = cardsConnection.pageInfo || {};
  const hasNextPage = Boolean(pageInfo.hasNextPage);
  const endCursor = pageInfo.endCursor || null;

  return {
    cards,
    hasNextPage,
    endCursor
  };
}

/**
 * Função que busca TODOS os cards de uma fase,
 * controlando a paginação internamente.
 */
export async function getAllCardsFromPhase(phaseId, pageSize = 50) {
  let allCards = [];
  let cursor = null;
  let hasNextPage = true;
  let pageNumber = 1;

  while (hasNextPage) {
    console.log(`🔎 Buscando página ${pageNumber} da fase ${phaseId}...`);

    const {
      cards,
      hasNextPage: nextPageExists,
      endCursor
    } = await fetchCardsPageByPhase(phaseId, cursor, pageSize);

    console.log(`📄 Página ${pageNumber} retornou ${cards.length} cards.`);

    allCards = allCards.concat(cards);

    hasNextPage = nextPageExists;
    cursor = endCursor;
    pageNumber += 1;
  }

  console.log(`📊 Total de cards encontrados na fase ${phaseId}: ${allCards.length}`);
  
  return allCards;
}

/**
 * Função auxiliar que retorna apenas os IDs de todos os cards de uma fase.
 */
export async function getAllCardIdsFromPhase(phaseId, pageSize = 50) {
  const allCards = await getAllCardsFromPhase(phaseId, pageSize);
  const ids = allCards.map((card) => card.id);

  console.log(`🧾 IDs coletados (${ids.length}):`, ids);

  return ids;
}

/**
 * Atualiza um campo específico de um card no Pipefy.
 * Aqui usamos interpolação do newValue na query, sem variável GraphQL para evitar o erro de tipo.
 * ⚠️ IMPORTANTE: não use newValue com aspas duplas sem tratar/escapar.
 */
export async function updateCardPipefy(cardId, fieldId, newValue) {
  console.log(`🔄 Atualizando card ${cardId} (campo ${fieldId} => "${newValue}")...`);

  const query = `
    mutation UpdateCardField(
      $card_id: ID!,
      $field_id: ID!
    ) {
      updateCardField(
        input: {
          card_id: $card_id
          field_id: $field_id
          new_value: "${newValue}"
        }
      ) {
        card {
          id
        }
      }
    }
  `;

  const variables = {
    card_id: cardId,
    field_id: fieldId
  };

  const requestBody = {
    query,
    variables
  };

  const response = await fetch(PIPEFY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type" : "application/json",
      Authorization: `Bearer ${pipefyToken}`
        },
    body: JSON.stringify(requestBody)
  });

  const responseBody = await response.json();

  if (!response.ok || responseBody.errors) {
    console.error(`❌ Erro ao atualizar card ${cardId}:`, responseBody.errors);
    throw new Error(`Erro ao atualizar card ${cardId} no Pipefy.`);
  }

  console.log(`✅ Card ${cardId} atualizado com sucesso.`);

  return responseBody.data.updateCardField.card.id;
}

/**
 * Atualiza um campo em TODOS os cards de uma fase.
 */
export async function updateFieldByCard(
  phaseId,
  pageSize = 50,
  fieldId,
  newValue
) {
  console.log(`📦 Buscando IDs de todos os cards da fase ${phaseId}...`);

  const allCardIds = await getAllCardIdsFromPhase(phaseId, pageSize);

  console.log(`🚚 Iniciando atualização em ${allCardIds.length} cards...`);

  let index = 0;
  const total = allCardIds.length;

  for (const cardId of allCardIds) {
    index += 1;
    console.log(`➡️ [${index}/${total}] Atualizando card ${cardId}...`);
    await updateCardPipefy(cardId, fieldId, newValue);
  }

  console.log("🎉 Todos os cards foram atualizados com sucesso.");
}
