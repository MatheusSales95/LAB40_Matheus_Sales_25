# LAB40 – Laboratório de Funcionalidades Web

Projeto-base para avaliação prática de Integração e Entrega Contínua (CI/CD).

**Módulo atribuído:** Enunciado 25 – Identificador de ano bissexto (`src/features/feature25.js`)

## Requisitos
- Node.js 20 ou superior.
- npm.
- Docker (para a etapa de container).

## Executar localmente
```bash
npm install
npm start
```
Acesse http://localhost:3000. Para desenvolvimento com reinicialização automática: `npm run dev`.

## Endpoints
- `GET /health`: verificação de disponibilidade.
- `GET /api/features`: lista as 40 funcionalidades e seus estados.
- `POST /api/features/:id`: executa uma funcionalidade, recebendo JSON no corpo.

Exemplo (feature 25):
```bash
curl -X POST http://localhost:3000/api/features/25 -H "Content-Type: application/json" -d '{"ano":2024}'
# {"id":25,"name":"Identificador de ano bissexto","result":{"bissexto":true}}
```

## Feature 25 – Identificador de ano bissexto

| | |
|---|---|
| Entrada | `{ "ano": <inteiro positivo> }` |
| Saída | `{ "bissexto": <boolean> }` |
| Regra | bissexto se divisível por 400, **ou** divisível por 4 e **não** por 100 |
| Referência | `ano=2024` → `bissexto=true` |

### Decisões técnicas
- **Calendário gregoriano proléptico:** a regra também vale para anos anteriores a 1582 (por exemplo, `ano=1` → `false`, `ano=4` → `true`).
- **Sem conversão de tipo:** `"2024"` (texto) é rejeitado. O campo deve ser `number`, como pedem os testes de referência.
- **Limites:** o menor ano válido é `1`. O maior é `Number.MAX_SAFE_INTEGER` (9007199254740991), para garantir aritmética inteira exata.
- **Erros:** toda entrada inválida lança `Error` (não `TypeError`/`RangeError`), com uma mensagem específica para cada caso: campo ausente, não numérico, não inteiro, não positivo e acima do limite. A API converte o erro em HTTP 400 sem derrubar o servidor.
- O objeto de entrada não é modificado, e o retorno é serializável em JSON.

## Scripts
| Comando | O que faz |
|---|---|
| `npm test` | Testes automatizados (`node:test` nativo): unitários da feature 25 e integração da API |
| `node --test test/feature25.test.js` | Só os testes da feature 25 |
| `node --test --test-reporter=spec` | Testes com relatório detalhado |
| `npm run lint` | Análise estática com ESLint |
| `npm run format:check` | Verificação de formatação (Prettier) |
| `npm run format` | Aplica a formatação |
| `npm run test:smoke` | Sobe o servidor e verifica `/health`, `/api/features` e a feature 25 |
| `npm run audit` | `npm audit --audit-level=high` |

O Prettier verifica só os arquivos criados/alterados por este módulo (`src/features/feature25.js`, `test/`, `scripts/`, `eslint.config.js`). Os arquivos do template ficam fora (`.prettierignore`), porque o contrato proíbe alterar `src/app.js`, `src/server.js`, `public/` e os módulos de outros estudantes.

O smoke test também valida um servidor ou container já em execução:
```bash
BASE_URL=http://localhost:3000 npm run test:smoke
```

### Cobertura dos testes automatizados
- **Caso típico:** 2024 → `true`; 2023 → `false`.
- **Fronteira:** 1900 → `false`; 2000 → `true`; 2100 → `false`; 2400 → `true`; 1 → `false`; 4 → `true`; 100 → `false`; 400 → `true`; `MAX_SAFE_INTEGER` aceito e `MAX_SAFE_INTEGER + 1` rejeitado.
- **Inválidos:** 0, -4, 2024.5, `"2024"`, `NaN`, `Infinity`, booleano, `null`, array, objeto, campo ausente, entrada que não é objeto.
- **Contrato:** `id`/`name`/`description` preservados, `implemented=true`, entrada não modificada, retorno serializável.
- **API:** `/health`, catálogo com 40 módulos, POST válido → 200, POST inválido → 400, JSON malformado → 400 com o servidor ainda ativo.

## Roteiro de testes manuais
1. `npm install` e `npm start`. O terminal deve mostrar `LAB40 disponível na porta 3000`.
2. Abra http://localhost:3000/health. O resultado esperado é `{"status":"ok","application":"LAB40"}`.
3. Abra http://localhost:3000/api/features. A feature 25 deve aparecer com `"implemented": true`.
4. Na interface (http://localhost:3000), selecione **25 · Identificador de ano bissexto**, mantenha o exemplo `{"ano": 2024}` e clique em executar. O resultado esperado é `httpStatus: 200` e `result.bissexto: true`.
5. Na interface, troque a entrada para `{"ano": 1900}` e execute. O resultado esperado é `bissexto: false` (exceção do século).
6. Troque a entrada para `{"ano": 2000}` e execute. O resultado esperado é `bissexto: true` (divisível por 400).
7. Troque a entrada para `{"ano": "2024"}` e execute. O resultado esperado é `httpStatus: 400` com uma mensagem de erro clara.
8. Troque a entrada para `{"ano": 0}` e depois para `{"ano": 2024.5}`. Os dois devem retornar `httpStatus: 400`.
9. Pela API: `curl -i -X POST http://localhost:3000/api/features/25 -H "Content-Type: application/json" -d '{"ano":2024}'`. O resultado esperado é `HTTP/1.1 200` com `"bissexto":true`.
10. Abra `/health` de novo e confirme que o servidor continua ativo depois dos erros.

## Qualidade e segurança
- **Lint:** ESLint 10 (flat config em `eslint.config.js`) com `@eslint/js` recommended e as regras `eqeqeq`, `prefer-const` e `no-var`. Usa globals de Node para `src/`, `test/` e `scripts/`, e de browser para `public/`.
- **Dependências:** não há dependências de produção. As de desenvolvimento são `eslint`, `@eslint/js`, `globals` (ambientes do lint) e `prettier` (formatação). Elas não entram na imagem Docker (`npm ci --omit=dev`).
- **Auditoria:** `npm audit --audit-level=high` retornou `found 0 vulnerabilities` (27/11/2026).
- **Segredos:** nenhuma senha, token ou chave no repositório. `.env*` está no `.gitignore` e no `.dockerignore`.

## Docker
```bash
docker build --pull -t lab40:feature25 .
docker images
docker run -d --name lab40-container -p 3000:3000 lab40:feature25
docker ps
curl --fail http://localhost:3000/health
curl --fail -X POST http://localhost:3000/api/features/25 -H "Content-Type: application/json" -d '{"ano":2024}'
docker logs lab40-container
docker stop lab40-container && docker rm lab40-container
docker save lab40:feature25 -o lab40-feature25.tar
```
- **Imagem:** `node:22-alpine`. Instala só as dependências de produção, roda como o usuário `node` (sem root) e tem um `HEALTHCHECK` na rota `/health`.
- **`.dockerignore`:** exclui `node_modules`, `.git`, `.env*`, logs, testes e material da prova.

## CI/CD (GitHub Actions)
- **`.github/workflows/ci.yml`:** roda em `push` e `pull_request`.
  - Job `quality` (Node 20 e 22): `npm ci`, verificação de formatação, lint, testes, `npm audit` e smoke test.
  - Job `docker` (só se o `quality` passar): build da imagem com tag `lab40:feature25-<SHA>`, container efêmero, validação de `/health` e do endpoint, e a imagem `.tar` guardada como artefato.
- **`.github/workflows/cd.yml`** (CD simulado): roda em `push` na `main` (após o merge).
  - Repete os testes, constrói a imagem `lab40:feature25-<sha7>` e valida o container.
  - Gera `lab40-feature25-<sha7>.tar` e o `deployment-record.txt` (repositório, referência, SHA, tag, image ID, sha256 do .tar e link da execução).
  - Publica tudo no artefato `lab40-delivery-record`.

## Estrutura
```text
├── .github/workflows/   ci.yml, cd.yml
├── public/              interface web (template)
├── scripts/smoke.js     smoke test
├── src/
│   ├── app.js / server.js
│   └── features/feature25.js
├── test/                feature25.test.js, api.test.js
├── Dockerfile / .dockerignore
├── eslint.config.js / .prettierrc.json / .prettierignore
├── package.json
└── package-lock.json
```

## Contrato de cada módulo
Cada arquivo `src/features/featureNN.js` exporta `id`, `name`, `description`, `implemented` e `execute(input)`. Enquanto `implemented` for `false`, a API retorna HTTP 501 para aquele módulo.

O servidor escuta `process.env.PORT` e `0.0.0.0`, e a aplicação não persiste dados em disco.
