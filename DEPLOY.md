# Guía de Despliegue Gratuito - FC Cañaveral

## Resumen
- **Frontend**: React/Vite → **Vercel** (gratis)
- **Backend**: Node.js/Express → **Render** (gratis)
- **Base de datos**: PostgreSQL → **Supabase** (gratis)

---

## PASO 1: Push de código a GitHub

Tu repo ya está en GitHub. Asegúrate de que los últimos cambios están subidos:

```bash
git add .
git commit -m "Migración a PostgreSQL Supabase y preparación para despliegue"
git push origin main
```

> ⚠️ **Importante**: El archivo `servidor/.env` NO debe subirse a GitHub (ya está en .gitignore). Las variables se configurarán en Render.

---

## PASO 2: Desplegar Backend en Render (GRATIS)

1. Ve a [https://render.com](https://render.com) y crea una cuenta (o inicia sesión con GitHub).

2. Haz clic en **"New +"** → **"Web Service"**.

3. Conecta tu repositorio de GitHub `proyecto-futbol-daw`.

4. **Configuración del servicio**:
   - **Name**: `fc-canaveral-api` (o el que quieras)
   - **Region**: El más cercano (Frankfurt si está disponible)
   - **Branch**: `main`
   - **Root Directory**: `servidor`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Instance Type**: **Free**

5. **Variables de Entorno** (Environment):
   
   Haz clic en **"Add Environment Variable"** y añade estas:

   | Variable | Valor |
   |----------|-------|
   | `DATABASE_URL` | Tu URL de Supabase (la que tienes en .env, empiezan con `postgresql://...`) |
   | `SECRET_KEY` | `f8a2_!99_DsK2l-02mZ_QpX92_#canaveral_secure_2026` |
   | `FRONTEND_URL` | Déjalo vacío de momento, lo actualizarás después de desplegar el frontend |

6. Haz clic en **"Create Web Service"**.

7. Espera a que el despliegue termine (puede tardar 2-5 minutos). El primer despliegue en el plan gratis tarda un poco más.

8. Cuando termine, copia la URL que te da Render (algo como `https://fc-canaveral-api.onrender.com`).

---

## PASO 3: Desplegar Frontend en Vercel (GRATIS)

1. Ve a [https://vercel.com](https://vercel.com) y crea una cuenta (o inicia sesión con GitHub).

2. Haz clic en **"Add New..."** → **"Project"**.

3. Importa tu repositorio `proyecto-futbol-daw`.

4. **Configuración del proyecto**:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `cliente` (haz clic en "Edit" y selecciona la carpeta `cliente`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Variable de Entorno**:
   
   Haz clic en **"Environment Variables"** y añade:

   | Variable | Valor |
   |----------|-------|
   | `VITE_API_URL` | La URL de tu backend en Render (paso 2), ej: `https://fc-canaveral-api.onrender.com` |

6. Haz clic en **"Deploy"**.

7. Espera a que termine. Vercel te dará una URL como `https://tu-proyecto.vercel.app`.

---

## PASO 4: Conectar Frontend con Backend (CORS)

1. Vuelve a **Render** → tu servicio backend → **Environment**.

2. Actualiza la variable `FRONTEND_URL` con la URL de Vercel:
   - `FRONTEND_URL` = `https://tu-proyecto.vercel.app` (la URL que te dio Vercel)

3. Haz clic en **"Save Changes"**. Render redeployará automáticamente.

---

## PASO 5: Verificar que todo funciona

1. Abre tu app en Vercel: `https://tu-proyecto.vercel.app`
2. Prueba:
   - Ver la página principal (debe cargar partidos, clasificación, productos, jugadores)
   - Ir a la tienda
   - Iniciar sesión con `raul@test.com` / `1234`
   - Acceder al panel de admin (`/admin`)
   - Crear un jugador nuevo
   - Ver el perfil

---

## Solución de Problemas

### Error CORS
Si ves errores de CORS en la consola del navegador:
- Verifica que `FRONTEND_URL` en Render coincide EXACTAMENTE con la URL de Vercel (sin barra al final).
- Redeploya el backend en Render después de cambiar la variable.

### Error de conexión a la base de datos
- Verifica que `DATABASE_URL` en Render es correcto (cópialo desde Supabase → Project Settings → Database → Connection string → URI).
- Usa la URL con **pgbouncer** (Transaction mode) si es posible: puerto 6543.

### El backend tarda mucho en responder
- El plan gratis de Render **se duerme** después de 15 min de inactividad. La primera petición tras el "sueño" tarda ~30-50 segundos en responder. Esto es normal en el plan gratis.

### El frontend no encuentra la API
- Verifica que `VITE_API_URL` en Vercel tiene la URL correcta del backend.
- Si cambias la variable en Vercel, necesitas hacer un **redeploy** (Vercel → Deployments → ... → Redeploy).

---

## URLs importantes

| Servicio | URL |
|----------|-----|
| Supabase Dashboard | https://supabase.com/dashboard |
| Render Dashboard | https://dashboard.render.com |
| Vercel Dashboard | https://vercel.com/dashboard |

### Cómo obtener DATABASE_URL de Supabase:
1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Settings (engranaje abajo izquierda) → **Database**
4. Sección **Connection string** → selecciona **URI**
5. Copia la cadena que empieza por `postgresql://...`

### Para usar Supabase Storage (imágenes):
1. En Supabase → Storage → crea un bucket llamado `player-photos`
2. Configura las políticas para permitir lectura pública
3. Añade las variables `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` en Render
4. Implementa el endpoint de subida de imágenes en el backend
