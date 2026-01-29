# Solución al Problema de WebSockets en Vercel

## 🔴 Problema

Vercel **NO soporta conexiones WebSocket** en su infraestructura serverless. Tu aplicación necesita WebSockets para recibir datos en tiempo real de F1, por lo que no puede funcionar completamente en Vercel sin cambios.

## ✅ Solución

Desplegar un **servidor proxy WebSocket** en un servicio que SÍ soporte WebSockets (como Railway, Render, o Fly.io).

## 📋 Pasos para Solucionar

### 1. Desplegar el Proxy WebSocket en Railway (GRATIS)

#### a) Crear cuenta en Railway
1. Ve a [railway.app](https://railway.app)
2. Regístrate con GitHub (gratis, no requiere tarjeta de crédito)

#### b) Desplegar el proxy
1. En Railway, haz click en **"New Project"**
2. Selecciona **"Deploy from GitHub repo"**
3. Conecta tu cuenta de GitHub
4. Selecciona este repositorio: `UniversalMotorsportTiming`
5. En la configuración del proyecto:
   - **Root Directory**: `websocket-proxy`
   - Railway detectará automáticamente el `package.json`
6. Haz click en **"Deploy"**

#### c) Obtener la URL del proxy
1. Una vez desplegado, ve a **Settings** → **Domains**
2. Haz click en **"Generate Domain"**
3. Copia la URL generada (ejemplo: `https://universal-motorsport-timing-production.up.railway.app`)

### 2. Configurar la Aplicación Angular

Abre el archivo `src/app/services/f1-livetiming.service.ts` y busca esta línea (aproximadamente línea 248):

```typescript
const PROXY_URL = 'wss://f1-websocket-proxy-production-9991.up.railway.app'; // ⚠️ CHANGE THIS
```

Reemplázala con tu URL de Railway (cambia `https://` por `wss://`):

```typescript
const PROXY_URL = 'wss://f1-websocket-proxy-production-9991.up.railway.app';
```

### 3. Redesplegar en Vercel

```bash
# Hacer commit de los cambios
git add .
git commit -m "Configure Railway WebSocket proxy"
git push

# Vercel desplegará automáticamente
```

## 🎯 Arquitectura Final

```
┌─────────────┐
│   Browser   │
│  (Angular)  │
└──────┬──────┘
       │
       ├─── HTTP/HTTPS ──────────┐
       │                         │
       │                    ┌────▼─────┐
       │                    │  Vercel  │
       │                    │ (Static) │
       │                    └──────────┘
       │
       └─── WebSocket ───────────┐
                                 │
                            ┌────▼─────┐
                            │ Railway  │
                            │  (Proxy) │
                            └────┬─────┘
                                 │
                            ┌────▼─────┐
                            │    F1    │
                            │LiveTiming│
                            └──────────┘
```

## 🔄 Alternativas a Railway

### Render (También gratis)
1. Ve a [render.com](https://render.com)
2. Crea un **Web Service**
3. Conecta tu repositorio
4. Root Directory: `websocket-proxy`
5. Build Command: `npm install`
6. Start Command: `npm start`

### Fly.io (Más complejo pero potente)
```bash
cd websocket-proxy
flyctl launch
flyctl deploy
```

## 🧪 Probar Localmente

Para probar que todo funciona antes de desplegar:

```bash
# Terminal 1: Iniciar el proxy
cd websocket-proxy
npm install
npm start

# Terminal 2: Iniciar Angular
cd ..
ng serve
```

Abre `http://localhost:4200` y verifica que los datos de F1 se cargan correctamente.

## ❓ Preguntas Frecuentes

### ¿Por qué no puedo usar solo Vercel?
Vercel está diseñado para funciones serverless de corta duración. Los WebSockets requieren conexiones persistentes de larga duración, que Vercel no soporta.

### ¿El proxy de Railway es gratis?
Sí, Railway ofrece 500 horas gratis al mes, más que suficiente para este proyecto.

### ¿Puedo usar otro servicio?
Sí, cualquier servicio que soporte Node.js y WebSockets funcionará (Render, Heroku, Fly.io, etc.).

### ¿Qué pasa si no despliego el proxy?
La aplicación se conectará pero no recibirá datos en tiempo real de F1. Solo funcionará en desarrollo local.

## 📝 Notas Importantes

- ⚠️ **NO olvides cambiar** `PROXY_URL` en `f1-livetiming.service.ts`
- ✅ El proxy debe estar **siempre activo** para que la app funcione en producción
- 🔒 Railway mantiene el servicio activo automáticamente
- 📊 Puedes ver los logs del proxy en el dashboard de Railway

## 🆘 Solución de Problemas

### Error: "WebSocket connection failed"
- Verifica que el proxy esté desplegado y activo en Railway
- Confirma que la URL en `PROXY_URL` es correcta (debe empezar con `wss://`)
- Revisa los logs en Railway para ver si hay errores

### Error: "Negotiation failed"
- Verifica que el proxy de Vercel (`/f1-api`) esté configurado en `vercel.json`
- Confirma que hay una sesión de F1 activa

### Los datos no se actualizan
- Verifica que haya una sesión de F1 en vivo
- Revisa la consola del navegador para ver errores
- Comprueba los logs del proxy en Railway
