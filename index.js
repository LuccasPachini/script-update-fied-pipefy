// Nosso entrypoint (liga o motor…)
import { updateFieldByCard } from "./src/FindAndUpdateFields.js";

const phaseId = "340952537";          // ID da fase que você quer atualizar
const fieldId = "c_digo_cidade";      // ID do campo a atualizar
const newValue = "teste123";          // Novo valor a ser aplicado

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
