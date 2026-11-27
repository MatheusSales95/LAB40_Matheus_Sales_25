// Testes de integração da API HTTP (sem serviços externos: servidor em porta efêmera).
const test = require("node:test");
const assert = require("node:assert/strict");
const { createServer } = require("node:http");
const app = require("../src/app");

let server;
let baseUrl;

test.before(async () => {
  server = createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  await new Promise((resolve) => server.close(resolve));
});

// Envia POST com corpo JSON para a feature 25.
async function postFeature25(body) {
  const response = await fetch(`${baseUrl}/api/features/25`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body
  });
  return { status: response.status, data: await response.json() };
}

test("GET /health responde 200 com status ok", async () => {
  const response = await fetch(`${baseUrl}/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok", application: "LAB40" });
});

test("GET /api/features lista 40 módulos e a 25 está implementada", async () => {
  const response = await fetch(`${baseUrl}/api/features`);
  const data = await response.json();
  assert.equal(response.status, 200);
  assert.equal(data.total, 40);
  assert.equal(data.items.length, 40);
  const item = data.items.find((f) => f.id === 25);
  assert.equal(item.implemented, true);
  assert.equal(item.name, "Identificador de ano bissexto");
});

test("POST /api/features/25 com ano=2024 → 200 e result.bissexto=true", async () => {
  const { status, data } = await postFeature25(JSON.stringify({ ano: 2024 }));
  assert.equal(status, 200);
  assert.deepEqual(data, {
    id: 25,
    name: "Identificador de ano bissexto",
    result: { bissexto: true }
  });
});

test("POST /api/features/25 com ano=1900 → 200 e result.bissexto=false", async () => {
  const { status, data } = await postFeature25(JSON.stringify({ ano: 1900 }));
  assert.equal(status, 200);
  assert.equal(data.result.bissexto, false);
});

test("POST /api/features/25 com ano inválido → 400 com mensagem de erro", async () => {
  for (const body of [{ ano: "2024" }, { ano: 0 }, { ano: 2024.5 }, {}]) {
    const { status, data } = await postFeature25(JSON.stringify(body));
    assert.equal(status, 400, `corpo ${JSON.stringify(body)}`);
    assert.equal(typeof data.error, "string");
    assert.ok(data.error.length > 0);
  }
});

test("POST /api/features/25 com JSON malformado → 400 e servidor continua ativo", async () => {
  const { status } = await postFeature25("{ano:");
  assert.equal(status, 400);
  const health = await fetch(`${baseUrl}/health`);
  assert.equal(health.status, 200);
});
