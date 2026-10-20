<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=180&color=390f16&text=DESPLIEGUE&fontColor=ffff&fontSize=48&fontAlignY=32&desc=Render%20%C2%B7%20Neon%20%C2%B7%20Vercel%20%C2%B7%20Lucha%20o%20Muere&descColor=EDE6D6&descAlignY=58"/>
</p>

Guía para dejar el proyecto vivo en la nube y sirviéndolo desde
`lucha.navyri.online` (subdominio gratis en Vercel). Este repo contiene ambas
piezas: `backend/` (Express) y `frontend/` (Next.js).

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&height=6&color=390F16"/>
</p>

## 1. Base de datos — Neon (gratis)

1. [neon.tech](https://neon.tech) → crear cuenta → **New project**.
2. En **SQL Editor**, pega y ejecuta el contenido de [`backend/db-schema.sql`](./backend/db-schema.sql)
   (13 tablas, tipos ENUM e índices; esquema sin datos).
3. En **Connection Details** copia: **Host**, **Database**, **User**, **Password**.

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&height=6&color=390F16"/>
</p>

## 2. Backend — Render (gratis)

1. [render.com](https://render.com) → **New → Web Service** → conecta este repo.
2. Configuración (ojo al Root Directory):

   | Campo | Valor |
   | --- | --- |
   | Root Directory | `backend` |
   | Runtime | Node |
   | Build Command | `npm install && npm run build` |
   | Start Command | `node dist/app.js` |
   | Instance Type | Free |

3. **Environment Variables** (igual que `backend/.env.example`):

   | Variable | Valor |
   | --- | --- |
   | `JWT_SECRET` | uno nuevo: `openssl rand -hex 32` |
   | `DB_HOST` | host de Neon |
   | `DB_PORT` | `5432` |
   | `DB_NAME` | `neondb` |
   | `DB_USER` | `default` |
   | `DB_PASSWORD` | contraseña de Neon |
   | `DB_SSL` | `true` |

4. Deploy → anota la URL pública (`https://<servicio>.onrender.com`).

> El plan free duerme tras 15 min sin uso: la primera petición tarda ~50 s.

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&height=6&color=390F16"/>
</p>

## 3. Frontend — Vercel (gratis)

1. [vercel.com](https://vercel.com) → **New Project** → importa este mismo repo.
2. **Root Directory**: `frontend` (Settings → General).
3. **Environment Variables**:

   | Variable | Valor |
   | --- | --- |
   | `NEXT_PUBLIC_API_URL` | `https://<servicio>.onrender.com` (sin barra al final) |

4. Deploy.
5. **Settings → Domains** → agrega `lucha.navyri.online`.

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&height=6&color=390F16"/>
</p>

## 4. DNS — navyri.online

En el panel donde tengas el dominio, agrega:

| Tipo | Nombre | Valor |
| --- | --- | --- |
| CNAME | `lucha` | `cname.vercel-dns.com` |

Vercel emite el certificado HTTPS automáticamente.

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&height=6&color=390F16"/>
</p>

## 5. Primer usuario

1. Abre `lucha.navyri.online`.
2. Registra el **Admin** inicial (solo puede existir uno):

   ```bash
   curl -X POST https://<servicio>.onrender.com/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username": "admin", "password": "<contraseña-fuerte>", "role": "Admin"}'
   ```

3. Entra al panel y desde **crear-usuario** registra Dictadores y Sponsors
   (nacen inactivos; el admin los activa).

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=rect&height=6&color=390F16"/>
</p>

## Autora

· © <a href="https://github.com/navyri" target="_blank">**Mariana Esguerra**</a>

Proyecto final de Ingeniería Web — semestre 2025-1.

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&height=120&section=footer&color=390f16" alt=""/>
</p>
