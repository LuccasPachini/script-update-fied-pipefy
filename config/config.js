import dotenv from "dotenv"; 
dotenv.config(); // Lê todo o arquivo .env e joga no process.env

const PipefyToken = process.env.TOKEN_PIPEFY; // Chama a variável TOKEN_PIPEFY do arquivo .env

// Verifica se a variável está preenchida
if(!PipefyToken){
    throw new Error("A variável (TOKEN_PIPEFY) não foi definida no arquivo .env");
}

// Exporta um objeto, para ser escalável caso o nosso projeto cresça
export default {
  pipefy: {
    token: PipefyToken,
  }
};