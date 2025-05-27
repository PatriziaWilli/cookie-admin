# Stage 1: builder
FROM node:20-alpine AS builder
WORKDIR /srv/strapi

# Installa tutte le dipendenze
COPY package.json package-lock.json ./
RUN npm ci

# Copia il resto del codice e builda l'admin
COPY . .
RUN npm run build

# Stage 2: produzione
FROM node:20-alpine
WORKDIR /srv/strapi
ENV NODE_ENV=production

# Copia solo package + lock per installare le dipendenze di produzione
COPY --from=builder /srv/strapi/package.json /srv/strapi/package-lock.json ./
RUN npm ci --omit=dev

# Copia il build e il resto dei sorgenti
COPY --from=builder /srv/strapi ./

EXPOSE 1337
CMD ["npm", "start"]
