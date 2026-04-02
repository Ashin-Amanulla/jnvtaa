# Production image for JNVTAA API
FROM node:20-alpine

WORKDIR /app

RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001 -G nodejs

COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=nodejs:nodejs . .

USER nodejs

ENV NODE_ENV=production
EXPOSE 5454

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:${PORT:-5454}/health || exit 1

CMD ["node", "app.js"]
