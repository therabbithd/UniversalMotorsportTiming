# Arquitectura de Sistemas de Tiempo Real: Caso F1 Telemetry

**Tema:** Arquitectura de Sistemas de Tiempo Real
**Audiencia:** Informático / Arquitecto de Software (Senior)
**Duración:** 20 min (15' charla + 5' demo)
**Fuentes:** RFC 6455 (WebSocket), Ably Realtime Whitepapers, RxJS Documentation.

---

## 01. THE CONTEXT
*(Timing: 2 min)*

```text
+-------------------------------------------------------+
| 1. SECTION DIVIDER                                    |
|                                                       |
|               SECTION 01: THE CONTEXT                 |
|                                                       |
|            "Latency is the new downtime."             |
|                                                       |
|  ---------------------------------------------------  |
|  Objetivo: Definir el reto del dato efímero.          |
+-------------------------------------------------------+
```

```text
+-------------------------------------------------------+
| 2. HERO CONCEPT ⚡                                    |
|                                                       |
|        REAL-TIME DATA IS NOT JUST "FAST"              |
|                                                       |
|  Es sobre consistencia, orden y delta-compression.    |
|  En F1, 1 segundo de latencia = dato obsoleto.        |
|                                                       |
|  > El reto no es recibir, es procesar.                |
+-------------------------------------------------------+
```

```text
+-------------------------------------------------------+
| 3. THE PROBLEM 📉                                     |
|                                                       |
|  \times CORS Hell: API oficial bloquea navegadores.   |
|  \times Bandwidth: JSONs de 5MB cada 200ms es inviable|
|  \times Protocol: SignalR propietario y cerrado.      |
|                                                       |
|  Solución: Un "Man-in-the-Middle" inteligente.        |
+-------------------------------------------------------+
```

---

## 02. ARCHITECTURE
*(Timing: 5 min)*

```text
+-------------------------------------------------------+
| 4. SECTION DIVIDER                                    |
|                                                       |
|             SECTION 02: THE ARCHITECTURE              |
|                                                       |
|         "Serverless Edge + Pub/Sub Pattern"           |
|                                                       |
|  ---------------------------------------------------  |
|  Stack: Angular 17, RxJS, Ably, Pako (zlib).          |
+-------------------------------------------------------+
```

```text
+-------------------------------------------------------+
| 5. ASCII FRAMEWORK 🏗️                                 |
|                                                       |
|  [F1 API] --(SignalR)--> [Node Proxy]                 |
|                              |                        |
|                        (Ably Pub/Sub)                 |
|                              |                        |
|  [Browser] <--(WSS)-------+                           |
|      |                                                |
|  (RxJS Stream) -> (Pako Unzip) -> (UI Render)         |
+-------------------------------------------------------+
```

```text
+-------------------------------------------------------+
| 6. MENTAL MODEL 🧠                                    |
|                                                       |
|  No envíes el estado completo. Envía solo cambios.    |
|                                                       |
|  State T0: { "VER": { "Pos": 1, "Lap": 5 } }          |
|  Delta T1: { "VER": { "Lap": 6 } }                    |
|                                                       |
|  Client Logic: State_New = DeepMerge(State_Old, Delta)|
+-------------------------------------------------------+
```

---

## 03. DEEP DIVE (CODE)
*(Timing: 5 min)*

```text
+-------------------------------------------------------+
| 7. SECTION DIVIDER                                    |
|                                                       |
|               SECTION 03: CODE ANALYSIS               |
|                                                       |
|           "Universal Motorsport Timing"               |
|                                                       |
|  ---------------------------------------------------  |
|  Core: f1-livetiming.service.ts                       |
+-------------------------------------------------------+
```

```text
+-------------------------------------------------------+
| 8. ULTRA PROMPT (CODE) 💻                             |
|                                                       |
|  // RxJS + Pako para inflar datos binarios            |
|  private parseCompressed(data: string): any {         |
|    const buffer = Uint8Array.from(atob(data), ...);   |
|    const inflated = pako.inflateRaw(buffer);          |
|    return JSON.parse(inflated);                       |
|  }                                                    |
+-------------------------------------------------------+
```

```text
+-------------------------------------------------------+
| 9. COMPARATIVE MATRIX 📊                              |
|                                                       |
|  Feature      | Polling | Native WS | Ably (Used)     |
|  -------------|---------|-----------|---------------- |
|  Real-time    | \times  | \checkmark| \checkmark      |
|  Reliability  | \checkmark| \times  | \checkmark      |
|  Scale        | \times  | \times  | \checkmark      |
|  Dev Effort   | Low     | High      | Medium          |
+-------------------------------------------------------+
```

---

## 04. DEMOSTRACIÓN
*(Timing: 5 min - Espacio práctico)*

```text
+-------------------------------------------------------+
| 10. SECTION DIVIDER                                   |
|                                                       |
|                 SECTION 04: SHOWTIME                  |
|                                                       |
|            "Talk is cheap. Show me the code."         |
|                                                       |
|  ---------------------------------------------------  |
|  Live Demo de la aplicación Angular.                  |
+-------------------------------------------------------+
```

```text
+-------------------------------------------------------+
| 11. EXERCISE / DEMO STEPS 🕹️                          |
|                                                       |
|  1. Abrir Dashboard (Circuit Map Component).          |
|  2. Inspeccionar Network WS (Ver frames binarios).    |
|  3. Observar interpolación de coches (suavidad).      |
|  4. Simular desconexión (Reconnection logic).         |
|                                                       |
|  > Validar: Latencia < 200ms vs TV Feed.              |
+-------------------------------------------------------+
```

---

## 05. CLOSING
*(Timing: 3 min)*

```text
+-------------------------------------------------------+
| 12. SECTION DIVIDER                                   |
|                                                       |
|                SECTION 05: NEXT STEPS                 |
|                                                       |
|           "From Consumer to Creator"                  |
|                                                       |
|  ---------------------------------------------------  |
|  Plan de acción para implementar esto mañana.         |
+-------------------------------------------------------+
```

```text
+-------------------------------------------------------+
| 13. IMPLEMENTATION CHECKLIST 🛠️                       |
|                                                       |
|  \checkmark Configurar Proxy Serverless (evitar CORS).|
|  \checkmark Elegir transporte (Socket.io / Ably).     |
|  \checkmark Implementar Binary Compression (Gzip).    |
|  \checkmark Desacoplar UI del Stream (Service Workers)|
|  \checkmark Manejar "Backpressure" con RxJS.          |
+-------------------------------------------------------+
```

```text
+-------------------------------------------------------+
| 14. CALL TO ACTION 🚀                                 |
|                                                       |
|        FORK THIS REPO. BREAK IT. FIX IT.              |
|                                                       |
|  La mejor forma de aprender RxJS no es leer,          |
|  es manejar un stream de datos que no puedes parar.   |
|                                                       |
|  > Go build something real-time.                      |
+-------------------------------------------------------+
```

---

### 📦 Recursos Finales
1.  **Repo:** `UniversalMotorsportTiming` (Angular + Ably).
2.  **Snippet:** Función `deepObjectMerge` (Línea 333 de `f1-livetiming.service.ts`).
3.  **Librería:** `pako` (High speed zlib port).

---

## 06. REQUIREMENTS MET
*(Timing: 3 min)*

```text
+-------------------------------------------------------+
| 15. SECTION DIVIDER                                   |
|                                                       |
|             SECTION 06: COMPLIANCE CHECK              |
|                                                       |
|           "Meeting the Standards"                     |
|                                                       |
|  ---------------------------------------------------  |
|  Verificación de requisitos técnicos implementados.   |
+-------------------------------------------------------+
```

### 🔐 AUTENTICACIÓN
```text
+-------------------------------------------------------+
| 16. HERO CONCEPT: AUTHENTICATION 🔐                   |
|                                                       |
|        SECURITY MEETS USER EXPERIENCE                 |
|                                                       |
|  \checkmark Registro: Interfaz dedicada (RegisterComponent)|
|  \checkmark Login: Seguro y separado (LoginComponent)      |
|  \checkmark Token: Gestión segura vía AuthService          |
|                                                       |
|  > "Security should be invisible to the user."        |
+-------------------------------------------------------+
```

### 🛠️ SERVICIOS
```text
+-------------------------------------------------------+
| 17. FRAMEWORK: SERVICE ARCHITECTURE 🛠️                |
|                                                       |
|  [UI Layer] -> [Facade/Service] -> [API/Ably]         |
|                                                       |
|  \checkmark Communications: Capas desacopladas (StreamSvc)|
|  \checkmark Dependency Injection: providedIn: 'root'      |
|  \checkmark Hybrid Connection: WebSocket + Ably Fallback  |
+-------------------------------------------------------+
```

### 🧩 COMPONENTES Y RUTAS
```text
+-------------------------------------------------------+
| 18. CHECKLIST: COMPONENTS & ROUTING 🧩                |
|                                                       |
|  [x] Modular Structure (/components, /timing-table)   |
|  [x] Standalone Components (Angular 17+)              |
|  [x] Centralized Routing (app.routes.ts)              |
|  [x] Smart Navigation (Register -> Login -> Dash)     |
|  [x] Wildcard Routes (404 Handling)                   |
+-------------------------------------------------------+
```

### 🎨 INTERFAZ DE USUARIO (UI)
```text
+-------------------------------------------------------+
| 19. VISUAL MATRIX: UI/UX STACK 🎨                     |
|                                                       |
|  Component    | Tech Stack      | Status              |
|  -------------|-----------------|-------------------- |
|  Framework    | Angular Material| \checkmark (Animations)|
|  Charts       | Syncfusion/Chart| \checkmark (Telemetry) |
|  Layout       | Flex/Grid       | \checkmark (Responsive)|
|  Theme        | Dark Mode       | \checkmark (F1 Style)  |
+-------------------------------------------------------+
```

