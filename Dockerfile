# Estágio de Build
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Estágio de Produção
FROM nginx:alpine

# Copiar a configuração do Nginx customizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar os arquivos estáticos do build
COPY --from=build /app/dist /usr/share/nginx/html

# Expor a porta 8080 (padrão do Cloud Run)
EXPOSE 8080

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]
