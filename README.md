<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=210&color=390f16&text=LUCHA%20O%20MUERE&fontColor=ffff&fontSize=56&fontAlignY=32&desc=Sistema%20de%20combates%20full-stack%20con%20JWT%20y%20roles%20%C2%B7%20Ingenier%C3%ADa%20Web%202025-1&descColor=EDE6D6&descAlignY=58"/>
</p>

<p align="center">
  <a href="https://lucha.navyri.online" title="Abrir Lucha o Muere en la nube">
    <img src="./docs/banner.gif" height="150" alt="Lucha o Muere — abrir la app"/>
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Express-REST-991B1B?style=flat-square&logo=express&logoColor=white"/>
  <img src="https://img.shields.io/badge/TypeScript-strict-7F1D1D?style=flat-square&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/PostgreSQL-13-1A1A1A?style=flat-square&logo=postgresql&logoColor=DC2626"/>
  <img src="https://img.shields.io/badge/JWT-auth-991B1B?style=flat-square"/>
  <img src="https://img.shields.io/badge/Next.js-15-0F0F0F?style=flat-square&logo=nextdotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-19-7F1D1D?style=flat-square&logo=react&logoColor=white"/>
  <img src="https://img.shields.io/badge/Tailwind-v4-1A1A1A?style=flat-square&logo=tailwindcss&logoColor=DC2626"/>
  <img src="https://img.shields.io/badge/despliegue-0%20USD-EDE6D6?style=flat-square"/>
  <img src="https://img.shields.io/badge/curso-Ingenier%C3%ADa%20Web%202025--1-390F16?style=flat-square"/>
</p>

**Lucha o Muere** es el sistema de combates full-stack que la Dictadora Suprema Carolina organizó para
entretenerse gobernando el continente. Proyecto final del curso de **Ingeniería Web (semestre 2025-1)**:
un backend en Express + PostgreSQL con autenticación JWT y tres roles, y un frontend en Next.js que
expone tres paneles protegidos. Los dictadores entrenan concursantes y proponen batallas contra otros
territorios; los sponsors financian peleas con armas y mejoras y comercian en el mercado negro; el
admin aprueba, inicia y cierra los combates. Todo con apuestas, buffs aplicables en pleno combate,
eventos especiales y el ciclo completo de batalla: propuesta, aprobación, pelea y cierre con ganador,
muertes e informe de lesiones.

Ambas piezas corren gratis en la nube (0 USD): frontend en Vercel, API en Render y base de datos en Neon.

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&height=6&color=390F16"/>
</p>

## Requisitos

| Componente | Versión | Notas |
|---|---|---|
| Node.js | 18+ | backend (Express) y frontend (Next.js) |
| PostgreSQL | 14+ | local o un contenedor Docker; en la nube se usa Neon |
| npm | 9+ | gestor de paquetes de ambos proyectos |

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&height=6&color=390F16"/>
</p>

## Arranque rápido (local)

```bash
# 1. Backend
cd backend
npm install
cp .env.example .env            # completar JWT_SECRET y credenciales de PostgreSQL
psql -U postgres -d lucha_db -f db-schema.sql   # crea las 13 tablas
npm run build
npm start                       # node dist/app.js (npm run dev para desarrollo)

# 2. Frontend
cd ../frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local
npm run dev                     # http://localhost:3001
```

El frontend no tiene registro público: el **primer usuario** registrado con rol `Admin` queda como
administrador inicial (solo puede existir uno) y desde su panel crea dictadores y sponsors:

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123", "role": "Admin"}'
```

Los usuarios creados por el admin nacen **inactivos** y el admin los activa desde su panel.

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&height=6&color=390F16"/>
</p>

## Credenciales de prueba

| Campo | Valor |
|---|---|
| Usuario | `admin` |
| Contraseña | `admin123` |
| Rol | `Admin` (inicial, creado con el comando de arriba) |

## Características

| Característica | Detalle |
|---|---|
| Autenticación JWT | Registro, login y activación de cuenta; tokens firmados por el backend |
| Control por roles | Cada endpoint restringe Admin, Dictador o Sponsor; los dictadores y sponsors tienen además control de cuenta activa |
| Ciclo de batallas | Propuesta entre territorios → aprobación del admin → combate → cierre con ganador, muertes e informe de lesiones |
| Mercado negro | Los sponsors publican armas y mejoras; los dictadores compran y equipan a sus concursantes |
| Apuestas y buffs | Apuestas previas a cada batalla y buffs aplicables también durante el combate |
| Eventos | "Coding Challenges to the Death" activos por fechas y cerrados por el admin |
| Concursantes | Estadísticas de combate, ítems asignados, actualización y liberación a la libertad |
| UI oscura | Next.js + Tailwind con paleta rojo sangre sobre negro y scrollbar temático |

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&height=6&color=390F16"/>
</p>

## Estructura del proyecto

```text
lucha-o-muere/
├── backend/
│   ├── src/
│   │   ├── app.ts              # Express + montaje de las 4 familias de rutas
│   │   ├── config/db.ts        # Pool de PostgreSQL (SSL configurable vía DB_SSL)
│   │   ├── controllers/        # Lógica de cada endpoint
│   │   ├── middlewares/        # authenticate · restrictByRole · isActive*
│   │   ├── models/             # Queries a la base de datos
│   │   └── routes/             # auth · admin · dictator · sponsor
│   ├── db-schema.sql           # Esquema completo (13 tablas, sin datos)
│   └── .env.example            # Variables de entorno documentadas
├── frontend/
│   ├── app/
│   │   ├── login/              # Inicio de sesión
│   │   ├── welcome/            # Bienvenida y selector de panel
│   │   ├── admin/              # usuarios · crear-usuario · batallas
│   │   ├── dictator/           # contestants · batallas · apuestas · blackmarket · inventario
│   │   ├── sponsor/            # lo mismo que dictator + publicaciones propias
│   │   └── components/         # auth · layout · features (UI por rol)
│   ├── middleware.ts           # Protección de rutas por rol
│   ├── lib/api.ts              # Cliente axios con NEXT_PUBLIC_API_URL
│   └── app/globals.css         # Tema + scrollbar temático
├── docs/banner.gif             # Banner pixel art
├── DESPLIEGUE.md               # Guía Render + Neon + Vercel
└── README.md
```

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&height=6&color=390F16"/>
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
  <img src="https://capsule-render.vercel.app/api?type=rect&height=6&color=390F16"/>
</p>

## Despliegue en la nube (0 USD)

Un solo repositorio con dos orígenes de despliegue:

- **Backend** → Render, con Root Directory `backend` (build `npm install && npm run build`,
  start `node dist/app.js`) y base de datos **PostgreSQL en Neon** (`DB_SSL=true`).
- **Frontend** → Vercel, con Root Directory `frontend` y la variable
  `NEXT_PUBLIC_API_URL=https://<servicio>.onrender.com`.
- **DNS**: un CNAME `lucha` → `cname.vercel-dns.com` deja la app en `lucha.navyri.online`.

El paso a paso completo está en [DESPLIEGUE.md](./DESPLIEGUE.md).

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&height=6&color=390F16"/>
</p>

## Repositorios originales

Durante el curso el proyecto se desarrolló en dos repositorios separados, conservados tal cual:

- [Backend_Final_IngWeb](https://github.com/navyri/Backend_Final_IngWeb) — API Express del semestre.
- [Frontend_Final_IngWeb](https://github.com/navyri/Frontend_Final_IngWeb) — frontend Next.js del semestre.

Este repo los reúne en una sola carpeta (`backend/` + `frontend/`) con las mejoras necesarias para
el despliegue permanente: soporte SSL para bases en la nube (`DB_SSL`), variables de entorno
documentadas, esquema SQL versionado sin datos y README unificado.

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&height=6&color=390F16"/>
</p>

## Autora

· © <a href="https://github.com/navyri" target="_blank">**Mariana Esguerra**</a>

Proyecto final de Ingeniería Web — semestre 2025-1.

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=120&section=footer&color=390f16" alt=""/>
</p>
