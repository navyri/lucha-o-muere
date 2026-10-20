<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=180&color=390f16&text=FRONTEND&fontColor=ffff&fontSize=48&fontAlignY=32&desc=UI%20Next.js%20de%20Lucha%20o%20Muere%20%C2%B7%20Ingenier%C3%ADa%20Web%202025-1&descColor=EDE6D6&descAlignY=58"/>
</p>

<p align="center">
  <a href="https://lucha.navyri.online" title="Abrir Lucha o Muere en la nube">
    <img src="../docs/banner.gif" height="159" alt="Lucha o Muere — abrir la app"/>
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-0F0F0F?style=flat-square&logo=nextdotjs&logoColor=white"/>
  <img src="https://img.shields.io/badge/React-19-7F1D1D?style=flat-square&logo=react&logoColor=white"/>
  <img src="https://img.shields.io/badge/Tailwind-v4-1A1A1A?style=flat-square&logo=tailwindcss&logoColor=DC2626"/>
  <img src="https://img.shields.io/badge/shadcn%2Fui-components-991B1B?style=flat-square"/>
  <img src="https://img.shields.io/badge/paneles-3-EDE6D6?style=flat-square"/>
</p>

El **frontend** de *Lucha o Muere* es la interfaz oscura y distópica desde la cual las tres facciones
administran el bloodsport: una aplicación **Next.js 15 (App Router + Turbopack)** con React 19,
Tailwind CSS v4 y componentes shadcn/ui. El middleware protege cada ruta por rol y redirige al panel
correspondiente; el cliente axios adjunta el token JWT en cada petición a la
[API backend](../backend/README.md). El tema usa paleta rojo sangre sobre negro, incluido un
scrollbar temático a juego.

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&height=6&color=390F16"/>
</p>

## Requisitos

| Componente | Versión | Notas |
|---|---|---|
| Node.js | 18+ | Next.js 15 con Turbopack |
| Backend | corriendo | [backend/](../backend/README.md) en local o desplegado en Render |

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&height=6&color=390F16"/>
</p>

## Arranque rápido

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local   # URL de la API, sin barra al final
npm run dev                     # http://localhost:3001
```

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&height=6&color=390F16"/>
</p>

## Variables de entorno

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_API_URL` | URL base de la API (`http://localhost:3000` en local, `https://<servicio>.onrender.com` en Render) |

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&height=6&color=390F16"/>
</p>

## Paneles por rol

| Rol | Rutas | Qué puede hacer |
|---|---|---|
| Admin | `/admin/usuarios`, `/admin/crear-usuario`, `/admin/batallas` | Crear dictadores y sponsors, gestionar usuarios, aprobar/iniciar/cerrar batallas y ver eventos activos |
| Dictador | `/dictator/contestants`, `/dictator/batallas`, `/dictator/apuestas`, `/dictator/blackmarket`, `/dictator/inventario` | Gestionar concursantes, proponer combates, apostar, comprar en el mercado negro y aplicar buffs |
| Sponsor | `/sponsor/*` (las mismas secciones del dictador) | Financiar peleadores con ítems, publicar en el mercado negro, apostar y aplicar buffs |

El login (`/login`) entrega el JWT; el middleware de Next.js valida el token y el rol antes de
entrar a cada panel, y `/welcome` muestra la bienvenida con el selector.

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&height=6&color=390F16"/>
</p>

## Estructura

```text
frontend/
├── app/
│   ├── login/              # Inicio de sesión
│   ├── welcome/            # Bienvenida y selector de panel
│   ├── admin/              # usuarios · crear-usuario · batallas
│   ├── dictator/           # contestants · batallas · apuestas · blackmarket · inventario
│   ├── sponsor/            # lo mismo que dictator + publicaciones propias
│   ├── components/         # auth · layout · features (UI por rol)
│   └── globals.css         # Tema + scrollbar temático
├── middleware.ts           # Protección de rutas por rol
├── lib/api.ts              # Cliente axios con NEXT_PUBLIC_API_URL
└── .env.local              # No versionado (ver tabla de arriba)
```

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&height=6&color=390F16"/>
</p>

## Enlaces

- [Repo completo (backend + frontend)](../README.md)
- [Backend Express](../backend/README.md)
- [Guía de despliegue](../DESPLIEGUE.md)
- [Repositorio original del frontend](https://github.com/navyri/Frontend_Final_IngWeb)

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&height=6&color=390F16"/>
</p>

## Autora

· ©  <a href="https://github.com/navyri" target="_blank">**Mariana Esguerra**</a>

Proyecto final de Ingeniería Web — semestre 2025-1.

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=120&section=footer&color=390f16" alt=""/>
</p>
