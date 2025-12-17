# Universal Motorsport Timing

Un dashboard de tiempos en tiempo real diseñado para visualizar datos de telemetría de motorsport (específicamente F1). Esta aplicación procesa flujos de datos en vivo para mostrar posiciones de pilotos, tiempos de vuelta, historial de neumáticos y comunicaciones de radio del equipo, ofreciendo una experiencia de "muro de boxes" en el navegador.

## Técnicas Interesantes

El código emplea varias técnicas avanzadas para manejar datos de alta frecuencia en el frontend:

*   **Gestión de Estado Reactivo con RxJS**: La aplicación utiliza `BehaviorSubject` para mantener un estado inmutable (`LiveTimingState`) que se actualiza parcialmente. Esto permite que múltiples componentes (mapa, tabla, radios) se suscriban a un único flujo de verdad (`state$`) sin polling innecesario.
    *   [MDN: Observables (Concepto general)](https://developer.mozilla.org/en-US/docs/Web/API/Streams_API/Using_readable_streams) (Referencia conceptual, ya que RxJS es una librería externa)
*   **Descompresión de Datos en Cliente**: Para optimizar el ancho de banda, los datos de telemetría crítica (`CarData.z`, `Position.z`) se reciben comprimidos en Base64/zlib. Se utiliza `pako` para inflar estos datos binarios directamente en el navegador antes de procesarlos.
    *   [MDN: Base64 decoding (atob)](https://developer.mozilla.org/en-US/docs/Web/API/Window/atob)
*   **Estrategia de Conexión Híbrida**: El servicio implementa una lógica de conexión robusta que intenta primero una conexión vía **Ably** para escalabilidad, y hace fallback automático a una conexión **WebSocket** directa si falla, garantizando la disponibilidad del stream.
    *   [MDN: WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket_API)
*   **Deep Object Merging Recursivo**: En lugar de reemplazar el estado completo en cada actualización (lo que sería costoso), se utiliza una función personalizada de fusión recursiva para integrar solo los campos que han cambiado en el árbol de estado existente.

## Tecnologías y Librerías No Obvias

Para un desarrollador con experiencia, estas elecciones tecnológicas destacan por su utilidad específica:

*   **[Ably](https://ably.com/)**: Utilizado para la capa de mensajería en tiempo real Pub/Sub. Abstrae la complejidad de mantener conexiones WebSocket a escala global.
*   **[Syncfusion EJ2 Angular](https://www.syncfusion.com/angular-components)**: Una suite de componentes UI empresarial. Se usa aquí para manejar grids complejos y layouts que requieren alto rendimiento y características avanzadas "out-of-the-box".
*   **[Pako](https://github.com/nodeca/pako)**: Un port de zlib para JavaScript de alta velocidad. Esencial aquí porque la API de origen envía payloads comprimidos para reducir la latencia de red.
*   **[Chart.js](https://www.chartjs.org/)** con **[chartjs-plugin-datalabels](https://chartjs-plugin-datalabels.netlify.app/)**: Usado para renderizar el mapa del circuito y visualizaciones de datos.

## Estructura del Proyecto

```text
/
├── api/                  # Serverless functions (ej. autenticación con Ably)
├── src/
│   ├── app/
│   │   ├── components/   # Componentes UI reutilizables (Mapa, Radios, etc.)
│   │   ├── config/       # Configuraciones globales
│   │   ├── models/       # Interfaces TypeScript y definiciones de tipos
│   │   ├── services/     # Lógica de negocio y gestión de estado (F1LiveTimingService)
│   │   └── timing-table/ # Componente principal de la tabla de tiempos
│   └── assets/           # Recursos estáticos
└── ...
```

*   **[`api/`](./api)**: Contiene funciones backend ligeras, como `createTokenRequest.ts`, que actúan como puente de seguridad para generar tokens de acceso a servicios externos sin exponer claves en el cliente.
*   **[`src/app/services/`](./src/app/services)**: El núcleo de la lógica. Aquí reside `f1-livetiming.service.ts`, que orquesta la conexión, descompresión y distribución de datos a toda la app.
*   **[`src/app/components/circuit-map/`](./src/app/components/circuit-map)**: Contiene la lógica de visualización del circuito, traduciendo coordenadas de telemetría a un canvas interactivo.
