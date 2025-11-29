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
  // Query GraphQL que busca os cards da fase
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

  // Variáveis enviadas junto com a query
  const variables = {
    phaseId,
    first: pageSize,
    after: cursor
  };

  const requestBody = {
    query,
    variables
  };

  // Faz a requisição HTTP usando fetch (Node 18+ já tem fetch nativo)
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

  // Caso venha algum erro GraphQL
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
  let allCards = [];          // Armazena todos os cards encontrados
  let cursor = null;          // Inicializa o cursor (primeira vez será null)
  let hasNextPage = true;     // Inicia com 'true' porque vamos começar a buscar
  let pageNumber = 1;         // Para controlar o número da página sendo buscada

  while (hasNextPage) {
    console.log(`Buscando página ${pageNumber} da fase ${phaseId}...`);

    // Chama a função para pegar os cards de uma página
    const {
      cards,
      hasNextPage: nextPageExists,  // Variável que indica se há mais páginas
      endCursor                    // Cursor da próxima página
    } = await fetchCardsPageByPhase(phaseId, cursor, pageSize);

    console.log(`Página ${pageNumber} retornou ${cards.length} cards.`);

    // Adiciona os cards da página atual ao array de todos os cards
    allCards = allCards.concat(cards);

    // Atualiza a variável hasNextPage para saber se há mais páginas
    hasNextPage = nextPageExists;

    // Se há mais páginas, atualiza o cursor para a próxima página
    cursor = endCursor;

    // Incrementa o número da página
    pageNumber += 1;

    // Se não houver mais páginas, o loop vai parar automaticamente
  }

  console.log(`Total de cards encontrados na fase ${phaseId}: ${allCards.length}`);
  
  return allCards;  // Retorna todos os cards encontrados
}

/**
 * Função auxiliar que retorna apenas os IDs de todos os cards de uma fase.
 */
export async function getAllCardIdsFromPhase(phaseId, pageSize = 50) {
  const allCards = await getAllCardsFromPhase(phaseId, pageSize);
  return allCards.map((card) => card.id);
}

export async function updateCardPipefy(cardId){
    const query = 
        `mutation UpdateCardField($card_id: ID!, $field_id: ID!, $new_value: String!) {
            updateCardField(
                input: {
                card_id: $card_id
                field_id: $field_id
                new_value: $new_value
                }
            ) {
                card {
                id
                }
            }
        }`;

    const variables = {
        card_id: cardId,
        field_id: "c_digo_cidade",
        new_value: "teste"
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
    })

    const responseBody = await response.json();

    if (!response.ok || responseBody.errors) {
        console.error("Erro ao atualizar card:", responseBody.errors);
        throw new Error("Erro ao atualizar card no Pipefy.");
    }

    return responseBody.data.updateCardField.card.id;
}

export async function updateFieldByCard(phaseId, pageSize = 50){
    // allCardsIds recebe todos os IDs dos cards em um array
    const allCardsId = await getAllCardIdsFromPhase(phaseId, pageSize = 50);

    for(const cardId of allCardsId){
        await updateCardPipefy(cardId);
    }

    console.log("✅ Todos os cards foram atualizados.")
}