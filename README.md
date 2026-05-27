<div align="center">

# 🏎️ Universal Motorsport Timing
*Un dashboard de telemetría y tiempos de alta frecuencia para F1 y MotoGP directamente en tu navegador*

[![Angular](https://img.shields.io/badge/Angular-17.3-dd0031?style=flat-square&logo=angular&logoColor=white)](https://angular.dev)
[![Node](https://img.shields.io/badge/Node.js->=18-3c873a?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Ably](https://img.shields.io/badge/Realtime-Ably_|_WebSockets-orange?style=flat-square)](https://ably.com)

⭐ Si este proyecto te resulta útil, ¡dale una estrella en GitHub!

[Características](#características) • [Arquitectura](#arquitectura-del-sistema) • [Requisitos](#requisitos-previos) • [Instalación](#instalación-y-ejecución) • [Scripts](#scripts-disponibles) • [Documentación](#documentación-técnica)

</div>

---

**Universal Motorsport Timing** es un dashboard interactivo de tiempos y telemetría en tiempo real que procesa streams en vivo de alta frecuencia. Diseñado como una experiencia premium de "muro de boxes" (*pit wall*), actúa como el complemento de segunda pantalla (*second screen*) definitivo para los entusiastas del motorsport. Permite visualizar posiciones en pista en tiempo real, historiales de neumáticos (*stints*), tiempos de vuelta inteligentes y audios de las transmisiones de radio de los equipos.

> [!NOTE]
> **Optimizado para Alta Frecuencia**<br>
> La aplicación utiliza descompresión binaria directa en el cliente/servidor y algoritmos de fusión profunda (*deep merging*) recursivos para procesar miles de puntos de datos de telemetría por segundo sin sacrificar la fluidez del navegador (manteniendo constantes 60 FPS).

---

## Características

### 🏁 F1 Live Timing (Panel Principal)
*   **Tabla de Tiempos Interactiva**: Clasificación en vivo de la sesión con posiciones, números de vuelta, intervalos de distancia (`Interval` y `Gap`), e historiales completos de stints de neumáticos (indicando compuesto y antigüedad de la goma).
*   **Mapa del Circuito Dinámico**: Canvas interactivo que procesa coordenadas bidimensionales de telemetría `(X, Y)` recibidas del stream de F1, posicionando a los monoplazas sobre el trazado en tiempo real.
*   **Comunicaciones por Radio**: Reproducción de transmisiones de voz y visualización de transcripciones de las radios entre los pilotos y sus boxes en tiempo real.
*   **Control de Carrera y Banderas**: Sincronización inmediata con el estado oficial del circuito mediante notificaciones visuales y banderas dinámicas (Verde, Amarilla, Roja, Safety Car, VSC).

### 🏍️ MotoGP Timing (Huevo de Pascua)
*   **Cómo Desbloquear**: Escribe la palabra clave `moto` en cualquier sección de la app para desbloquear la ruta y menú de MotoGP.
*   **Estadísticas y Tiempos**: Acceso a clasificaciones, standings históricos por temporada y detalles específicos de sesiones de clasificación y carrera para las categorías **MotoGP, Moto2 y Moto3**.

### 📅 Calendario de la Temporada 2026
*   Cronograma de todas las rondas de la temporada actual.
*   Detalles de horarios de fin de semana, trazado interactivo de circuitos e integración de previsiones climáticas.

### 👤 Perfil y Personalización
*   Registro y autenticación con sesiones persistentes de usuario.
*   Configuración de biografía, piloto favorito, escudería y subida con recorte de fotos de perfil (avatares) integrada con **Cloudinary**.

---

## Arquitectura del Sistema

```text
  [ F1 SignalR Origin ]
           │  (Payloads comprimidos en zlib)
           ▼
  [ websocket-proxy / server.js ]  <-- Descompresión en servidor con Pako + Proxy CORS
           │  (WebSockets / JSON)
           ├───► [ MotoGP API (Dorna) ]
           ▼
  [ App Angular 17 ]  <-- RxJS State Management & Canvas Rendering
```

### ¿Por qué se utiliza un Servidor Proxy?
1.  **Restricciones de Cabeceras CORS**: El stream oficial de F1 requiere cabeceras HTTP específicas (como `User-Agent: BestHTTP`) que las especificaciones de seguridad de los navegadores web modernos no permiten inyectar de manera directa.
2.  **Protocolo de Negociación**: SignalR requiere una negociación inicial HTTP para obtener el `ConnectionToken` antes de elevar la conexión a WebSockets, proceso que gestiona el proxy transparentemente.
3.  **Descompresión Eficiente**: El proxy puede inflar los datos comprimidos en el backend, ahorrando ciclos de CPU y optimizando la batería del dispositivo del cliente final.

---

## Requisitos Previos

*   **Node.js**: Versión `>= 18.0.0`
*   **npm**: Gestor de paquetes oficial (incluido con Node.js)
*   **Conexión de Red**: Acceso a internet para resoluciones de API

---

## Instalación y Ejecución

Sigue estos sencillos pasos para iniciar tu entorno de desarrollo local:

<details open>
<summary><b>1. Clonar e Instalar dependencias del Frontend</b></summary>

Instala las dependencias en la raíz del proyecto:
```bash
npm install
```
</details>

<details>
<summary><b>2. Configurar e Instalar dependencias del Proxy</b></summary>

Navega a la carpeta del proxy e instala los paquetes necesarios:
```bash
cd websocket-proxy
npm install
cd ..
```
</details>

<details>
<summary><b>3. Iniciar el Proxy de WebSockets (Requerido para Live Timing)</b></summary>

Arranca el proxy de telemetría en desarrollo (puerto `3001`):
```bash
npm run dev:proxy
```
</details>

<details open>
<summary><b>4. Iniciar la Aplicación Angular</b></summary>

En una nueva pestaña de terminal, ejecuta el servidor de desarrollo del frontend:
```bash
npm run dev
```
Abre tu navegador e ingresa a: **[http://localhost:4200](http://localhost:4200)**.
</details>

---

## Scripts Disponibles

El `package.json` raíz provee los siguientes comandos utilitarios:

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia la app Angular en modo desarrollo en [localhost:4200](http://localhost:4200) |
| `npm run dev:proxy` | Inicia el servidor de proxy WebSocket local en el puerto `3001` |
| `npm run build` | Compila el frontend optimizado para producción en `/dist` |
| `npm run start` | Arranca el proxy WebSocket de producción directamente con Node |
| `npm run test` | Ejecuta las suites de pruebas unitarias con Karma |
| `npm run docs` | Genera el mapa del sitio y la documentación técnica de Compodoc |
| `npm run docs:serve` | Sirve la documentación del código localmente en [http://localhost:8080](http://localhost:8080) |

---

## Documentación Técnica

La base de código está documentada en su totalidad usando **Compodoc**. Puedes generar e inspeccionar las relaciones e inyecciones de dependencias, servicios y componentes ejecutando:

```bash
# Genera y levanta el servidor local de documentación
npm run docs:serve
```

Una vez levantado, navega a **[http://localhost:8080](http://localhost:8080)** para explorar la documentación interactiva del desarrollador.


