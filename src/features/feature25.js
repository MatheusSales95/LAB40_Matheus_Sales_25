// Funcionalidade 25: Identificador de ano bissexto.
// Objetivo: Verifica ano bissexto no calendário gregoriano.
// Exemplo de entrada: { ano: 2024 } -> saída: { bissexto: true }
//
// Decisões técnicas:
// - Calendário gregoriano proléptico: a regra é aplicada também a anos
//   anteriores a 1582 (ano em que o calendário foi adotado).
// - "ano" deve ser number inteiro e positivo. Strings como "2024" são
//   rejeitadas (sem conversão implícita), conforme os testes de referência.
// - Limite superior: Number.MAX_SAFE_INTEGER, para garantir aritmética exata.
// - Todos os erros são do tipo Error, com mensagem clara (a API devolve 400).

const implemented = true;

// Valida a entrada e retorna o ano já verificado.
function validarAno(input) {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    throw new Error('Entrada inválida: envie um objeto JSON no formato { "ano": 2024 }.');
  }
  if (!Object.prototype.hasOwnProperty.call(input, "ano") || input.ano === undefined) {
    throw new Error('Campo "ano" é obrigatório.');
  }

  const { ano } = input;
  if (typeof ano !== "number") {
    throw new Error('Campo "ano" deve ser um número (não use texto).');
  }
  if (!Number.isInteger(ano)) {
    throw new Error('Campo "ano" deve ser um número inteiro.');
  }
  if (ano <= 0) {
    throw new Error('Campo "ano" deve ser um inteiro positivo (maior que zero).');
  }
  if (!Number.isSafeInteger(ano)) {
    throw new Error(`Campo "ano" deve ser menor ou igual a ${Number.MAX_SAFE_INTEGER}.`);
  }
  return ano;
}

// Regra gregoriana: divisível por 400, ou divisível por 4 e não por 100.
function ehBissexto(ano) {
  return ano % 400 === 0 || (ano % 4 === 0 && ano % 100 !== 0);
}

// Valida os dados, aplica a regra de negócio e retorna objeto serializável em JSON.
function execute(input) {
  const ano = validarAno(input);
  return { bissexto: ehBissexto(ano) };
}

// Mantém o contrato de integração utilizado pela API central.
module.exports = {
  id: 25,
  name: "Identificador de ano bissexto",
  description: "Verifica ano bissexto no calendário gregoriano.",
  implemented,
  execute
};
