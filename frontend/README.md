# PlantCare Frontend

Interfaz web moderna para la aplicación de recomendaciones de cuidado de plantas según el clima.

## Características

- 🌱 Interfaz limpia y moderna con colores naturales
- 📱 Diseño responsive
- 🔄 Integración con API REST de Django
- 🐳 Listo para Docker
- ⚡ Construido con Next.js y Tailwind CSS

## Configuración

### Variables de entorno

Modifica las siguientes constantes en `app/page.tsx`:

\`\`\`typescript
const API_BASE_URL = 'http://localhost:8000' // URL de tu backend Django
const RECOMMEND_ENDPOINT = '/api/recommend/' // Endpoint de recomendaciones
\`\`\`

### Lista de plantas

Actualiza el array `AVAILABLE_PLANTS` en `app/page.tsx` con las plantas que maneja tu API:

\`\`\`typescript
const AVAILABLE_PLANTS = [
  { value: 'rosa', label: 'Rosa' },
  // Agrega más plantas aquí
]
\`\`\`

### Estructura de respuesta de la API

La aplicación espera que tu API Django devuelva un JSON con esta estructura:

\`\`\`json
{
  "temperatura": 25,
  "humedad": 60,
  "recomendaciones": "Texto con las recomendaciones...",
  "ciudad": "Buenos Aires",
  "planta": "rosa"
}
\`\`\`

Si tu API tiene una estructura diferente, modifica la interfaz `ApiResponse` en `app/page.tsx`.

## Desarrollo

\`\`\`bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Construir para producción
npm run build

# Ejecutar en producción
npm start
\`\`\`

## Docker

\`\`\`bash
# Construir imagen
docker build -t plant-care-frontend .

# Ejecutar contenedor
docker run -p 3000:3000 plant-care-frontend

# O usar docker-compose
docker-compose up --build
\`\`\`

## Estructura del proyecto

\`\`\`
├── app/
│   ├── page.tsx          # Componente principal
│   ├── layout.tsx        # Layout de la aplicación
│   └── globals.css       # Estilos globales
├── components/ui/        # Componentes de UI (shadcn/ui)
├── Dockerfile           # Configuración de Docker
├── docker-compose.yml   # Orquestación de contenedores
└── package.json         # Dependencias y scripts
\`\`\`

## Personalización

- **Colores**: Modifica los colores en `tailwind.config.ts` y `globals.css`
- **API**: Ajusta `API_BASE_URL` y `RECOMMEND_ENDPOINT` según tu backend
- **Plantas**: Actualiza `AVAILABLE_PLANTS` con tus especies
- **Campos**: Modifica la interfaz `ApiResponse` según tu estructura JSON
