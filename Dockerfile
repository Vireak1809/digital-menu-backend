FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine AS migration
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
COPY prisma.config.ts ./
RUN npx prisma generate
CMD ["npx", "prisma", "migrate", "deploy"]

FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=build /app/dist ./dist
EXPOSE 4000
CMD ["node", "dist/index.js"]