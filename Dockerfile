FROM node:18-slim

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install --omit=dev

# Copiar el código
COPY . .

# Railway inyecta el PORT, no lo definimos aquí para evitar conflictos
CMD ["node", "websocket-proxy/server.js"]
