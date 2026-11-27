# Imagem-base oficial, leve (Alpine) e com Node.js LTS.
FROM node:22-alpine

# Diretório de trabalho dentro do container.
WORKDIR /app

# Ambiente de produção.
ENV NODE_ENV=production \
    PORT=3000

# Copia apenas os manifestos primeiro para aproveitar o cache de camadas.
COPY package*.json ./

# Instala somente dependências de produção, de forma reproduzível (lockfile).
RUN npm ci --omit=dev && npm cache clean --force

# Copia o código da aplicação.
COPY src ./src
COPY public ./public

# Executa como usuário sem privilégios (já existente na imagem oficial).
USER node

# Documenta a porta exposta pelo servidor.
EXPOSE 3000

# Verificação de saúde do container usando a rota /health.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health || exit 1

# Comando de inicialização da aplicação.
CMD ["npm", "start"]
