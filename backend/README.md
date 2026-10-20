<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=180&color=390f16&text=BACKEND&fontColor=ffff&fontSize=48&fontAlignY=32&desc=API%20Express%20%2B%20PostgreSQL%20de%20Lucha%20o%20Muere%20%C2%B7%20Ingenier%C3%ADa%20Web%202025-1&descColor=EDE6D6&descAlignY=58"/>
</p>

<p align="center">
  <a href="https://lucha.navyri.online" title="Abrir Lucha o Muere en la nube">
    <img src="../docs/banner.gif" height="160" alt="Lucha o Muere — abrir la app"/>
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Express-REST-991B1B?style=flat-square&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/TypeScript-strict-7F1D1D?style=flat-square&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/PostgreSQL-13-1A1A1A?style=flat-square&logo=postgresql&logoColor=DC2626"/>
  <img src="https://img.shields.io/badge/JWT-auth-991B1B?style=flat-square"/>
  <img src="https://img.shields.io/badge/endpoints-45-EDE6D6?style=flat-square"/>
</p>

El **backend** de *Lucha o Muere* es una API REST en Express + TypeScript que sostiene el sistema de
combates: PostgreSQL como base de datos (pool con SSL configurable para la nube), autenticación con
JWT y bcrypt, y control de acceso por roles aplicado endpoint por endpoint. Las 45 rutas se agrupan
en cuatro familias (`/auth`, `/admin`, `/dictator`, `/sponsor`) y las consume el
[frontend Next.js](../frontend/README.md) de este mismo repo.

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&height=6&color=0F0F0F"/>
</p>

## Requisitos

| Componente | Versión | Notas |
|---|---|---|
| Node.js | 18+ | Express + TypeScript compilado con `tsc` |
| PostgreSQL | 14+ | local o Docker; en la nube se usa Neon (`DB_SSL=true`) |
| npm | 9+ | dependencias del proyecto |

## Arranque rápido

```bash
cd backend
npm install
cp .env.example .env            # completar JWT_SECRET y credenciales de PostgreSQL
psql -U postgres -d lucha_db -f db-schema.sql   # crea las 13 tablas
npm run build
npm start                       # node dist/app.js (npm run dev para desarrollo)
```

El esquema [`db-schema.sql`](./db-schema.sql) versiona las 13 tablas, los tipos ENUM y los índices,
sin datos.

## Variables de entorno

Definidas en `.env` (en producción, como environment variables del servidor):

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor (Render lo inyecta solo) |
| `JWT_SECRET` | Secreto para firmar los tokens |
| `DB_HOST` | Host de PostgreSQL |
| `DB_PORT` | Puerto de PostgreSQL (`5432`) |
| `DB_NAME` | Nombre de la base de datos |
| `DB_USER` | Usuario de PostgreSQL |
| `DB_PASSWORD` | Contraseña de PostgreSQL |
| `DB_SSL` | `true` para bases en la nube que exigen SSL (Neon, Supabase) |

## Primer usuario

El primer usuario registrado con rol `Admin` queda como administrador inicial (solo puede existir
uno); desde su panel crea dictadores y sponsors:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123", "role": "Admin"}'
```

Los usuarios creados por el admin nacen **inactivos** y el admin los activa desde su panel.

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&height=6&color=0F0F0F"/>
</p>

## Endpoints

> Algunos nombres conservan los typos históricos del proyecto (`Aprove-Battles`, `Close/:battleId`,
> `Release-contestants`, `blackmarket/Activity`): el frontend los llama tal cual y se mantienen
> por compatibilidad.

### Autenticación — `/auth`

| Ruta | Contenido |
|---|---|
| `POST /auth/register` | Registro (crea el Admin inicial si aún no existe ninguno) |
| `POST /auth/login` | Login y emisión de token JWT |
| `POST /auth/activate` | Activación de la cuenta del usuario autenticado |

### Admin — `/admin`

| Ruta | Contenido |
|---|---|
| `POST /admin/register-dictator` | Registrar un Dictador |
| `POST /admin/register-sponsor` | Registrar un Sponsor |
| `GET /admin/users` | Listar usuarios |
| `DELETE /admin/users/:id` | Eliminar usuario |
| `POST /admin/unlock-user` | Desbloquear usuario |
| `GET /admin/get-All-Battles` | Listar todas las batallas |
| `GET /admin/get-Pending-Battles` | Batallas pendientes de aprobación |
| `POST /admin/Aprove-Battles` | Aprobar batalla |
| `POST /admin/start/:battleId` | Iniciar batalla |
| `POST /admin/Close/:battleId` | Cerrar batalla |
| `GET /admin/events/active` | Listar eventos activos |

### Dictador — `/dictator`

| Ruta | Contenido |
|---|---|
| `GET /dictator/contestants` | Listar sus concursantes |
| `GET /dictator/contestants/:contestantId/details` | Detalle de un concursante |
| `POST /dictator/add-contestants` | Crear concursante |
| `PUT /dictator/contestants/:contestantId` | Actualizar/activar concursante |
| `DELETE /dictator/Release-contestants/:contestantId` | Liberar concursante |
| `GET /dictator/available-opponents` | Listar posibles oponentes |
| `POST /dictator/propose-battle` | Proponer batalla |
| `GET /dictator/battles/active` | Listar batallas activas |
| `POST /dictator/place-bet` | Hacer apuesta |
| `GET /dictator/my-bets` | Ver mis apuestas |
| `POST /dictator/give-item` | Dar ítem a un concursante |
| `POST /dictator/apply-buff` | Aplicar buff |
| `POST /dictator/apply-buff/battle` | Aplicar buff durante una batalla |
| `GET /dictator/blackmarket/Activity` | Ver artículos del mercado negro |
| `POST /dictator/blackmarket/buy-item` | Comprar en el mercado negro |
| `GET /dictator/inventory` | Ver inventario propio |
| `POST /dictator/add-item` | Añadir ítem al inventario |
| `DELETE /dictator/delete-item` | Eliminar ítem del inventario |

### Sponsor — `/sponsor`

| Ruta | Contenido |
|---|---|
| `GET /sponsor/contestants` | Listar todos los concursantes |
| `GET /sponsor/profile` | Ver perfil del sponsor |
| `POST /sponsor/give-item` | Dar ítem a un concursante |
| `POST /sponsor/apply-buff` | Aplicar buff |
| `POST /sponsor/apply-buff/battle` | Aplicar buff durante una batalla |
| `POST /sponsor/blackmarket/offer-item` | Publicar ítem en el mercado negro |
| `GET /sponsor/blackmarket/listings` | Ver publicaciones propias |
| `DELETE /sponsor/blackmarket/remove-listing` | Eliminar publicación propia |
| `GET /sponsor/inventory` | Ver inventario |
| `POST /sponsor/add-item` | Añadir ítem al inventario |
| `DELETE /sponsor/delete-item` | Eliminar ítem del inventario |
| `GET /sponsor/battles/active` | Listar batallas activas |
| `POST /sponsor/place-bet` | Hacer apuesta |
| `GET /sponsor/my-bets` | Ver mis apuestas (también disponible para Dictadores) |

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&height=6&color=0F0F0F"/>
</p>

## Estructura

```text
backend/
├── src/
│   ├── app.ts              # Express + montaje de las 4 familias de rutas
│   ├── config/db.ts        # Pool de PostgreSQL (SSL configurable vía DB_SSL)
│   ├── controllers/        # Lógica de cada endpoint
│   ├── middlewares/        # authenticate · restrictByRole · isActive*
│   ├── models/             # Queries a la base de datos
│   └── routes/             # auth · admin · dictator · sponsor
├── db-schema.sql           # Esquema completo (13 tablas, sin datos)
└── .env.example            # Variables de entorno documentadas
```

## Enlaces

- [Repo completo (backend + frontend)](../README.md)
- [Frontend Next.js](../frontend/README.md)
- [Guía de despliegue](../DESPLIEGUE.md)
- [Repositorio original del backend](https://github.com/navyri/Backend_Final_IngWeb)

## Autora

**Mariana Esguerra** · [github.com/navyri](https://github.com/navyri)

Proyecto final de Ingeniería Web — semestre 2025-1.

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=120&section=footer&color=390f16" alt=""/>
</p>
