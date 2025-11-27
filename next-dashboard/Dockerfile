# Multi-stage build for Next.js dashboard
FROM node:18-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production || npm install --production
COPY . .
RUN npm run build

FROM base AS runner
WORKDIR /app
COPY --from=deps /app/package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/.next ./.next
COPY --from=deps /app/public ./public
EXPOSE 3001
CMD ["npm", "run", "start"]
