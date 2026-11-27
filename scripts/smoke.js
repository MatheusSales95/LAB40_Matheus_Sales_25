// Smoke test: verifica se a aplicação sobe e responde nas rotas principais.
// Uso:
//   npm run test:smoke                       -> inicia src/server.js em porta livre e testa
//   BASE_URL=http://localhost:3000 npm run test:smoke -> testa um servidor/container já em execução
const { spawn } = require("node:child_process");
const path = require("node:path");
const assert = require("node:assert/strict");

const TIMEOUT_MS = 15000;

async function waitForHealth(baseUrl) {
  const deadline = Date.now() + TIMEOUT_MS;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) return;
    } catch {
      // servidor ainda não aceitou conexões
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(`Servidor não respondeu em ${baseUrl}/health dentro de ${TIMEOUT_MS} ms.`);
}

async function check(baseUrl) {
  await waitForHealth(baseUrl);

  const health = await fetch(`${baseUrl}/health`);
  assert.equal(health.status, 200);
  assert.equal((await health.json()).status, "ok");
  console.log("OK  GET /health -> 200 status=ok");

  const catalog = await fetch(`${baseUrl}/api/features`);
  const data = await catalog.json();
  assert.equal(catalog.status, 200);
  assert.equal(data.items.length, 40);
  console.log("OK  GET /api/features -> 200 (40 módulos)");

  const run = await fetch(`${baseUrl}/api/features/25`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ano: 2024 })
  });
  const result = await run.json();
  assert.equal(run.status, 200);
  assert.equal(result.result.bissexto, true);
  console.log("OK  POST /api/features/25 {ano:2024} -> 200 bissexto=true");

  const invalid = await fetch(`${baseUrl}/api/features/25`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ano: "2024" })
  });
  assert.equal(invalid.status, 400);
  console.log('OK  POST /api/features/25 {ano:"2024"} -> 400');
}

async function main() {
  if (process.env.BASE_URL) {
    await check(process.env.BASE_URL.replace(/\/$/, ""));
    return;
  }

  const port = 3900 + Math.floor(Math.random() * 90);
  const child = spawn(process.execPath, [path.join(__dirname, "..", "src", "server.js")], {
    env: { ...process.env, PORT: String(port) },
    stdio: "inherit"
  });
  try {
    await check(`http://127.0.0.1:${port}`);
  } finally {
    child.kill();
  }
}

main()
  .then(() => console.log("Smoke test aprovado."))
  .catch((error) => {
    console.error(`Smoke test falhou: ${error.message}`);
    process.exit(1);
  });
