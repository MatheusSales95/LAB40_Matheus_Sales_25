// Testes automatizados – Feature 25 (Identificador de ano bissexto).
// Execute com: npm test   ou   node --test test/feature25.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const feature = require("../src/features/feature25");

// ---------- Contrato do módulo ----------
test("contrato: preserva id, name, description e implemented=true", () => {
  assert.equal(feature.id, 25);
  assert.equal(feature.name, "Identificador de ano bissexto");
  assert.equal(feature.description, "Verifica ano bissexto no calendário gregoriano.");
  assert.equal(feature.implemented, true);
  assert.equal(typeof feature.execute, "function");
});

// ---------- Caso válido típico (entrada de referência) ----------
test("caso típico: ano=2024 → bissexto=true (entrada de referência)", () => {
  assert.deepEqual(feature.execute({ ano: 2024 }), { bissexto: true });
});

test("caso típico: ano comum 2023 → bissexto=false", () => {
  assert.deepEqual(feature.execute({ ano: 2023 }), { bissexto: false });
});

// ---------- Fronteiras / exceções dos séculos ----------
test("fronteira: 1900 (divisível por 100, não por 400) → false", () => {
  assert.equal(feature.execute({ ano: 1900 }).bissexto, false);
});

test("fronteira: 2000 (divisível por 400) → true", () => {
  assert.equal(feature.execute({ ano: 2000 }).bissexto, true);
});

test("fronteira: 2100 → false e 2400 → true", () => {
  assert.equal(feature.execute({ ano: 2100 }).bissexto, false);
  assert.equal(feature.execute({ ano: 2400 }).bissexto, true);
});

test("fronteira: menor ano válido (1) → false", () => {
  assert.deepEqual(feature.execute({ ano: 1 }), { bissexto: false });
});

test("fronteira: anos pequenos 4 → true, 100 → false, 400 → true", () => {
  assert.equal(feature.execute({ ano: 4 }).bissexto, true);
  assert.equal(feature.execute({ ano: 100 }).bissexto, false);
  assert.equal(feature.execute({ ano: 400 }).bissexto, true);
});

test("fronteira: maior inteiro seguro é aceito; acima dele é rejeitado", () => {
  assert.equal(typeof feature.execute({ ano: Number.MAX_SAFE_INTEGER }).bissexto, "boolean");
  assert.throws(() => feature.execute({ ano: Number.MAX_SAFE_INTEGER + 1 }), { name: "Error" });
});

// ---------- Entradas inválidas ----------
test("inválido: rejeita zero, negativo, decimal e string (referência do professor)", () => {
  for (const ano of [0, -4, 2024.5, "2024"]) {
    assert.throws(() => feature.execute({ ano }), { name: "Error" });
  }
});

test("inválido: mensagens claras para cada tipo de erro", () => {
  assert.throws(() => feature.execute({}), { message: /obrigatório/ });
  assert.throws(() => feature.execute({ ano: "2024" }), { message: /número/ });
  assert.throws(() => feature.execute({ ano: 2024.5 }), { message: /inteiro/ });
  assert.throws(() => feature.execute({ ano: 0 }), { message: /positivo/ });
});

test("inválido: rejeita NaN, Infinity, booleano, null, array e objeto", () => {
  for (const ano of [NaN, Infinity, -Infinity, true, null, [2024], { valor: 2024 }]) {
    assert.throws(
      () => feature.execute({ ano }),
      { name: "Error" },
      `deveria rejeitar ${String(ano)}`
    );
  }
});

test("inválido: rejeita entrada ausente ou que não é objeto", () => {
  for (const input of [undefined, null, 2024, "2024", [2024]]) {
    assert.throws(() => feature.execute(input), { name: "Error" });
  }
});

// ---------- Propriedades do contrato ----------
test("não modifica o objeto de entrada", () => {
  const input = Object.freeze({ ano: 2024 });
  assert.doesNotThrow(() => feature.execute(input));
  assert.deepEqual(input, { ano: 2024 });
});

test("retorno é serializável em JSON e tem bissexto booleano", () => {
  const result = feature.execute({ ano: 2024 });
  assert.deepEqual(JSON.parse(JSON.stringify(result)), { bissexto: true });
  assert.equal(typeof result.bissexto, "boolean");
});
