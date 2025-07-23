# GreenAdvice - Recomendador de cuidado de plantas según clima

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE) [![Docker Image](https://img.shields.io/badge/docker-ready-brightgreen)](#)

## Índice

- [Descripción](#descripción)
- [Características Destacadas](#características-destacadas)
- [Demo](#demo)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación y Ejecución Local](#instalación-y-ejecución-local)
- [Uso con Docker Compose](#uso-con-docker-compose)
- [Pruebas](#pruebas)
- [Despliegue en Producción](#despliegue-en-producción)
- [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
- [Estructura de Carpetas](#estructura-de-carpetas)
- [Documentación de la API](#documentación-de-la-api)
- [Contribuciones](#contribuciones)
- [Mantenimiento y Roadmap](#mantenimiento-y-roadmap)
- [Licencia](#licencia)

---

## Descripción

**GreenAdvice** es una aplicación web que proporciona recomendaciones de cuidado de plantas basadas en las condiciones climáticas de la ubicación del usuario. Consume la API de OpenWeather para obtener datos de temperatura y humedad en tiempo real, compara estos valores con rangos ideales definidos para cada especie y genera sugerencias prácticas para el usuario.

La solución está dividida en:

- **Frontend**: Next.js (React). Interfaz intuitiva con autocompletado de ciudades y presentación clara de datos.
- **Backend**: Django REST Framework. Expone endpoints para:
  - Listar y gestionar especies de plantas.
  - Autocompletar ciudades mediante geocodificación de OpenWeather.
  - Generar recomendaciones basadas en clima.
- **Base de datos**: PostgreSQL.
- **Contenedores**: Docker y Docker Compose para desarrollo local y despliegue en entornos de producción.

Este README describe cómo instalar, ejecutar, probar y desplegar GreenAdvice, así como la estructura general y buenas prácticas incorporadas.

---

## Características Destacadas

- **Autocompletado de ciudades**: Búsqueda incremental de localidades usando la API de geocodificación de OpenWeather
- **Recomendaciones personalizadas**: Comparación automática de condiciones climáticas (temperatura y humedad) con rangos ideales de cuidado para cada planta.
- **API REST robusta**: Endpoints claros y versionables, manejo de errores, validaciones y respuestas consistentes.
- **Interfaz amigable**: Diseño limpio, uso de componentes UI, feedback de carga y mensajes claros de error.
- **Contenerización**: Dockerfiles para frontend y backend, Docker Compose para orquestar servicios en desarrollo.
- **Configuración para CI/CD**: Sugerencias para integrar con GitHub Actions o pipelines similares, tanto para construcción de imágenes como despliegue automático.
- **Entorno de producción preparado**: Ajustes para desplegar en Azure (App Service, Static Web Apps) con variables de entorno y escalabilidad.
- **Buenas prácticas**: Uso de variables de entorno, CORS configurado, logging básico, manejo de migraciones, estructura modular y documentación clara de todo el proceso.

---

## Demo

- **Backend (Azure)**: https://plantcare-backend-app.azurewebsites.net/api/plants/
- **Frontend (Azure Static/Web App o contenedor)**: https://green-advice.vercel.app/

> **Nota:** El dominio real dependerá del despliegue. Esta solo es una demo par ver las funcionalidades y como seria la app desplegada en produccion.

---

## Tecnologías

- **Frontend:**
  - Next.js
  - React
  - Tailwind CSS y componentes UI
- **Backend:**
  - Python 3.11+
  - Django 4.x
  - Django REST Framework
  - django-cors-headers
  - requests
  - dj-database-url, psycopg2-binary
- **Base de datos:** PostgreSQL (y SQLite en desarrollo).
- **Contenedores y Orquestación:** Docker, Docker Compose.
- **Despliegue:** Azure (App Service, Static Web Apps)
- **CI/CD (sugerido):** GitHub Actions para tests, build de imágenes y despliegue.

---

## Requisitos Previos

- **Node.js**: v18+ (para Next.js).
- **npm**: v8+.
- **Python**: v3.11+.
- **Docker & Docker Compose**: para entorno local y pruebas.
- **Cuenta en proveedor de nube**: Azure

---

## Instalación y Ejecución Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/greenadvice.git
cd greenadvice
```

### 2. Configurar el Backend

```bash
cd backend
py -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
``` 
En `backend/.env`, define:
```env
SECRET_KEY=tu_secret_local
DEBUG=True
OPENWEATHER_API_KEY=tu_api_key_openweather
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:3000
ALLOWED_HOSTS=localhost,127.0.0.1
```

### 3. Configurar el Frontend

```bash
cd ../frontend
npm install
cp .env.example .env
```
En `frontend/.env`, define:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

### 4. Ejecutar sin Docker (opcional)

En terminal separada:

```bash
# Backend
cd backend
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# Frontend
cd ../frontend
npm run dev
```
Accede a:
- Frontend: http://localhost:3000
- Backend Admin: http://localhost:8000/admin
- API: http://localhost:8000/api/plants/

### 5. Ejecutar con Docker Compose (recomendado)

En la raíz del proyecto:

```bash
docker-compose up --build
```

- Backend: http://localhost:8000
- Frontend: http://localhost:3000

Para detener y limpiar contenedores:

```bash
docker-compose down
```

---

## Pruebas

- **Backend:** agregar tests en Django para las vistas de recomendación, geocoding (mockeado) y serializadores.
- **Frontend:** pruebas con Jest/React Testing Library para componentes clave (validaciones, renderizado de resultados).
- **CI:** configurar GitHub Actions para ejecutar tests en push/PR.

> _Ejemplo de GitHub Action:_
> ```yaml
> name: CI
> on: [push, pull_request]
> jobs:
>   backend:
>     runs-on: ubuntu-latest
>     steps:
>       - uses: actions/checkout@v2
>       - name: Setup Python
>         uses: actions/setup-python@v2
>         with:
>           python-version: '3.11'
>       - name: Install dependencies
>         run: |
>           cd backend
>           python -m venv .venv
>           source .venv/bin/activate
>           pip install -r requirements.txt
>       - name: Run backend tests
>         run: |
>           cd backend
>           python manage.py test
>   frontend:
>     runs-on: ubuntu-latest
>     steps:
>       - uses: actions/checkout@v2
>       - name: Setup Node
>         uses: actions/setup-node@v2
>         with:
>           node-version: '18'
>       - name: Install and Test Frontend
>         run: |
>           cd frontend
>           npm install
>           npm test
> ```

---

## Despliegue en Producción

### Backend en Azure App Service (contenedor)
1. Construir imagen Docker y subir a Azure Container Registry.
2. Crear Azure Database for PostgreSQL y obtener `DATABASE_URL` con `sslmode=require`.
3. Crear App Service Plan y Web App para contenedor con la imagen de backend.
4. Configurar App Settings en Azure:
   ```text
   SECRET_KEY=tu_secret_produccion
   DEBUG=False
   OPENWEATHER_API_KEY=tu_api_key_prod
   DATABASE_URL=postgresql://usuario:pass@servidor:5432/dbname?sslmode=require
   ALLOWED_HOSTS=tu-dominio-backend
   CORS_ALLOWED_ORIGINS=https://tu-frontend
   ```
5. Ejecutar migraciones (en CMD o arranque automático).
6. Verificar endpoints.

### Frontend con Azure Static Web Apps
1. Ajustar Next.js para export: en `next.config.js`: `output: 'export'` o usar client-only.
2. Conectar repositorio a Static Web Apps en Azure.
3. Configurar build: App location `/frontend`, Output `out`.
4. Definir variable `NEXT_PUBLIC_API_BASE_URL=https://tu-backend`
5. Verificar despliegue.

_Opcionalmente, Frontend en App Service (contenedor) con imagen Docker similar al backend, definiendo `PORT=80` y `NEXT_PUBLIC_API_BASE_URL`._

---

## Configuración de Variables de Entorno

### Backend
En producción (App Settings o plataforma equivalentes):

```env
SECRET_KEY=valor_seguro
DEBUG=False
OPENWEATHER_API_KEY=tu_api_key_prod
DATABASE_URL=postgresql://usuario:pass@host:5432/db?sslmode=require
ALLOWED_HOSTS=tu-dominio-backend
CORS_ALLOWED_ORIGINS=https://tu-frontend
```

### Frontend
En producción:

```env
NEXT_PUBLIC_API_BASE_URL=https://tu-dominio-backend
```

---

## Estructura de Carpetas

```
greenadvice/
├─ backend/           # Código Django
│   ├─ Dockerfile
│   ├─ requirements.txt
│   ├─ .env.example
│   └─ greendadvice_backend/
│       └─ api/
├─ frontend/          # Código Next.js
│   ├─ Dockerfile
│   ├─ package.json
│   ├─ next.config.js
│   ├─ .env.example
│   └─ src/
└─ docker-compose.yml  # Orquesta db, backend, frontend en desarrollo
```

---

## Documentación de la API

### GET /api/plants/
Retorna lista de plantas:
```json
[
  { "value": "rosa", "label": "Rosa" },
  { "value": "lavanda", "label": "Lavanda" },
  ...
]
```

### GET /api/geocode/?q=<query>
Retorna sugerencias de ciudades:
```json
[
  { "name": "Buenos Aires", "state": "Buenos Aires", "country": "AR", "display": "Buenos Aires, Argentina", "lat": -34.6, "lon": -58.4 },
  ...
]
```

### POST /api/recommend/
Request:
```json
{ "planta": "rosa", "lat": -34.6, "lon": -58.4 }
```
Response:
```json
{
  "temperatura": 20.5,
  "humedad": 65,
  "descripcion_clima": "cielo claro",
  "recomendaciones": "La temperatura actual (20.5°C) está dentro... Instrucciones generales: ...",
  "ciudad": "Buenos Aires, Argentina",
  "planta": "Rosa"
}
```

> Ajusta campos según tu implementación.

---

## Contribuciones

1. Fork del repositorio.
2. Crear rama (`git checkout -b feature/nombre`).
3. Commit y push de cambios.
4. Abrir Pull Request con descripción clara del cambio.

Incluye tests cuando añadas lógica crítica.

---

## Mantenimiento y Roadmap

- **Mejoras futuras**:
  - Autenticación de usuarios para guardar plantas favoritas o historial.
  - Notificaciones (email o push) cuando la planta requiera atención urgente.
  - Pronóstico extendido (recomendaciones semanales).
  - Cache y optimización de llamadas a OpenWeather.
  - Panel de métricas de uso de la API.
  - Soporte a múltiples idiomas (i18n).
  - Integración con terceros (p. ej., sensores IoT de humedad si se quiere extender).
- **Monitoreo**:
  - Configurar Application Insights o logging centralizado.
  - Alertas en caso de errores frecuentes.
- **Backups**:
  - Programar backups automáticos de la base de datos en producción.

---

## Licencia

Este proyecto está licenciado bajo la [MIT License](LICENSE).

