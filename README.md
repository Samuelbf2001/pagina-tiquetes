# Student Travel Center

Aplicacion web para cotizacion de programas y simulacion de vuelos, con chat asistido por Gemini y despliegue listo para contenedor.

## Requisitos

- Node.js 22 o superior
- npm 10 o superior

## Variables de entorno

Crea un `.env.local` para desarrollo local o configura estas variables en tu plataforma de despliegue:

```env
GEMINI_API_KEY=tu_clave_de_google_ai
GEMINI_MODEL=gemini-3.1-pro-preview
PORT=4173
HOST=0.0.0.0
```

## Desarrollo local

```sh
npm install
npm run dev
```

La app quedara disponible en `http://localhost:4173`.

## Build de produccion

```sh
npm run build
npm run start
```

## Despliegue en Easypanel

Este repo ya incluye un `Dockerfile`, por lo que Easypanel puede construir la imagen directamente desde Git. Segun la documentacion oficial de Easypanel, cuando un repositorio tiene `Dockerfile`, el App Service lo utiliza para el build y luego solo hay que indicar el puerto del proxy que escucha la app.

### Configuracion recomendada

1. Crea un nuevo **App Service** desde tu repositorio.
2. Deja que Easypanel detecte y use el `Dockerfile`.
3. En **Environment**, configura:
   - `GEMINI_API_KEY`
   - `GEMINI_MODEL=gemini-3.1-pro-preview`
   - `PORT=4173`
   - `HOST=0.0.0.0`
4. En **Domains & Proxy**, usa como **Proxy Port** el `4173`.
5. Asocia el dominio o subdominio que quieras usar para esta app.
6. Despliega el servicio.

### Notas para VPS con otras apps

- No necesitas reservar un puerto publico manual si vas a exponer la app por **Domains & Proxy**.
- El contenedor escucha internamente en `4173`; Easypanel se encarga del enrutamiento junto con las otras apps.
- Si quieres revisar salud del contenedor, el endpoint es `/health`.
- El chat depende de `GEMINI_API_KEY`; sin esa variable, la UI cargara pero el asistente no respondera.

### Verificacion rapida

- Healthcheck: `https://tu-dominio/health`
- Chat API: `POST https://tu-dominio/api/chat`

## Scripts utiles

- `npm run dev`: servidor local con Vite y API de chat
- `npm run build`: build de frontend
- `npm run lint`: validacion de codigo
- `npm run start`: servidor de produccion

## Referencias

- Easypanel App Service: https://easypanel.io/docs/services/app
- Easypanel Dockerizer Node.js: https://easypanel.io/dockerizer/nodejs/
