FROM node:20-alpine

WORKDIR /srv/strapi

# 1) Installa solo prod-deps
COPY package*.json ./
RUN npm ci --omit=dev

# 2) Copia sorgenti e builda admin UI
COPY . .
RUN npm run build

EXPOSE 1337
CMD ["npm", "start"]
