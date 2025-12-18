# Universal Motorsport Timing: Technical Deep Dive

**Tema:** Arquitectura de Sistemas de Tiempo Real
**Audiencia:** Informático / Arquitecto de Software
**Duración:** 20 min (15' técnica + 5' demo)
**Fuentes:** Angular Architecture Patterns, WebSocket Protocol (RFC 6455).

---

## 01. EL RETO TÉCNICO
*(Timing: 2 min)*

```text
+-------------------------------------------------------+
| 1. SECTION DIVIDER                                    |
|                                                       |
|             SECTION 01: THE CHALLENGE                 |
|                                                       |
|       "Handling High-Frequency Data Streams"          |
|                                                       |
|  ---------------------------------------------------  |
|  Objetivo: Visualizar telemetría F1 en tiempo real.   |
+-------------------------------------------------------+
```

```text
+-------------------------------------------------------+
| 2. CORE CONCEPT ⚡                                    |
|                                                       |
|          LATENCY IS THE ENEMY OF REAL-TIME            |
|                                                       |
|  Requisito: Procesar paquetes de datos cada 200ms.    |
|  Solución: Arquitectura reactiva basada en eventos.   |
|                                                       |
|  > No es solo mostrar datos, es sincronizarlos.       |
+-------------------------------------------------------+
```

---

## 02. ARQUITECTURA DE SERVICIOS
*(Timing: 5 min)*

```text
+-------------------------------------------------------+
| 3. SECTION DIVIDER                                    |
|                                                       |
|             SECTION 02: CORE SERVICES                 |
|                                                       |
|          "Robust Data Layer Implementation"           |
|                                                       |
|  ---------------------------------------------------  |
|  Implementación: Capa de servicios desacoplada.       |
+-------------------------------------------------------+
```

```text
+-------------------------------------------------------+
| 4. IMPLEMENTATION: HYBRID STREAMING 🔄                |
|                                                       |
|  Hemos implementado un servicio de streaming híbrido: |
|                                                       |
|  1. Primary: WebSocket directo para baja latencia.    |
|  2. Fallback: Ably Realtime para alta disponibilidad. |
|  3. Optimization: Descompresión binaria (Pako/Zlib).  |
|                                                       |
|  > Resultado: Resiliencia ante fallos de red.         |
+-------------------------------------------------------+
```

```text
+-------------------------------------------------------+
| 5. ULTRA PROMPT (CODE) 💻                             |
|                                                       |
|  // F1LiveTimingStreamService: Gestión de Estado      |
|  private updateState(data: string): void {            |
|    // 1. Parsear mensaje SignalR                      |
|    const parsed = JSON.parse(data);                   |
|    // 2. Descomprimir payload binario (Base64)        |
|    if (parsed.R['CarData.z']) {                       |
|       parsed.R['CarData'] = this.unzip(parsed.R);     |
|    }                                                  |
|    // 3. Emitir nuevo estado inmutable                |
|    this.liveState.next(newState);                     |
|  }                                                    |
+-------------------------------------------------------+
```

---

## 03. AUTENTICACIÓN Y SEGURIDAD
*(Timing: 3 min)*

```text
+-------------------------------------------------------+
| 6. SECTION DIVIDER                                    |
|                                                       |
|             SECTION 03: AUTHENTICATION                |
|                                                       |
|           "Secure Access Control Layer"               |
|                                                       |
|  ---------------------------------------------------  |
|  Implementación: AuthService con JWT.                 |
+-------------------------------------------------------+
```

```text
+-------------------------------------------------------+
| 7. IMPLEMENTATION: USER-FRIENDLY AUTH 🔐              |
|                                                       |
|  Se cumple el requisito de seguridad y usabilidad:    |
|                                                       |
|  \checkmark Interfaz Dedicada: Login/Registro claros. |
|  \checkmark Feedback Visual: Manejo de errores HTTP.  |
|  \checkmark Tipado Estricto: Interfaces para I/O.     |
|                                                       |
|  El servicio `AuthService` centraliza toda la lógica  |
|  de comunicación con el backend, aislando a los       |
|  componentes de la complejidad HTTP.                  |
+-------------------------------------------------------+
```

---

## 04. COMPONENTES Y VISUALIZACIÓN
*(Timing: 5 min)*

```text
+-------------------------------------------------------+
| 8. SECTION DIVIDER                                    |
|                                                       |
|            SECTION 04: UI COMPONENTS                  |
|                                                       |
|           "Turning Data into Insight"                 |
|                                                       |
|  ---------------------------------------------------  |
|  Implementación: Componentes inteligentes y gráficos. |
+-------------------------------------------------------+
```

```text
+-------------------------------------------------------+
| 9. IMPLEMENTATION: CIRCUIT MAP 🏎️                     |
|                                                       |
|  El componente estrella `CircuitMapComponent`:        |
|                                                       |
|  1. Rendering: Usa Chart.js en modo 'Scatter'.        |
|  2. Math: Transforma coordenadas GPS a Canvas 2D.     |
|  3. Performance: Actualización reactiva sin repintado |
|     completo del DOM (Canvas optimization).           |
|                                                       |
|  > Cumple el requisito de visualización avanzada.     |
+-------------------------------------------------------+
```

```text
+-------------------------------------------------------+
| 10. IMPLEMENTATION: RESPONSIVE DASHBOARD 📱           |
|                                                       |
|  Estructura de la aplicación:                         |
|                                                       |
|  \checkmark Routing: Navegación fluida (SPA).         |
|  \checkmark Layout: Diseño adaptable (Flex/Grid).     |
|  \checkmark Feedback: Spinners de carga y estados.    |
|                                                       |
|  Se ha priorizado la experiencia de usuario (UX)      |
|  manteniendo la interfaz limpia y funcional.          |
+-------------------------------------------------------+
```

---

## 05. DEMOSTRACIÓN TÉCNICA
*(Timing: 5 min - Espacio práctico)*

```text
+-------------------------------------------------------+
| 11. SECTION DIVIDER                                   |
|                                                       |
|                 SECTION 05: LIVE DEMO                 |
|                                                       |
|            "System in Action"                         |
|                                                       |
|  ---------------------------------------------------  |
|  Validación de los requisitos implementados.          |
+-------------------------------------------------------+
```

```text
+-------------------------------------------------------+
| 12. DEMO STEPS 🕹️                                     |
|                                                       |
|  1. [Auth Flow]: Registro de usuario y obtención JWT. |
|  2. [Data Stream]: Conexión WebSocket y recepción.    |
|  3. [Visualization]:                                  |
|     - Ver el mapa del circuito renderizarse.          |
|     - Observar la interpolación de posiciones.        |
|  4. [Resilience]: Simular corte de red y reconexión.  |
+-------------------------------------------------------+
```

---

## 06. CONCLUSIONES
*(Timing: 2 min)*

```text
+-------------------------------------------------------+
| 13. SECTION DIVIDER                                   |
|                                                       |
|                SECTION 06: WRAP UP                    |
|                                                       |
|           "Architecture Validation"                   |
|                                                       |
|  ---------------------------------------------------  |
|  Resumen de logros técnicos.                          |
+-------------------------------------------------------+
```

```text
+-------------------------------------------------------+
| 14. KEY TAKEAWAYS 🚀                                  |
|                                                       |
|  Hemos logrado una aplicación robusta que cumple:     |
|                                                       |
|  \checkmark Seguridad: Autenticación estructurada.    |
|  \checkmark Performance: Manejo eficiente de binarios.|
|  \checkmark UX: Visualización compleja en tiempo real.|
|  \checkmark Arquitectura: Servicios escalables.       |
|                                                       |
|  > Ready for production deployment.                   |
+-------------------------------------------------------+
```

### 📦 Recursos del Proyecto
1.  **Repositorio:** `UniversalMotorsportTiming`
2.  **Tecnologías Clave:** Angular 17, RxJS, Chart.js, Ably.
3.  **Patrones:** Observable Data Services, Component Store.
