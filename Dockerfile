FROM node:18-slim

WORKDIR /app

# Copiar archivos de dependencias de la raíz
COPY package*.json ./

# Instalar dependencias esenciales
RUN npm install --omit=dev

# Copiar el código del proxy
COPY websocket-proxy ./websocket-proxy

# Variable de entorno para el puerto (proporcionada por Railway)
ENV PORT=3000
EXPOSE 3000

# Comando para arrancar el proxy
CMD ["node", "websocket-proxy/server.js"]
