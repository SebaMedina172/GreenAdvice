// Configuración de la API
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"
export const RECOMMEND_ENDPOINT = "/api/recommend/"
export const PLANTS_ENDPOINT = "/api/plants/"

// Ciudades mock para la búsqueda (Cambiar a futuro por API de Geolocalizacion)
export const MOCK_CITIES = [
  { name: "Buenos Aires", country: "Argentina", state: "Buenos Aires", display: "Buenos Aires, Argentina" },
  { name: "Madrid", country: "España", display: "Madrid, España" },
  { name: "Ciudad de México", country: "México", display: "Ciudad de México, México" },
  { name: "Lima", country: "Perú", display: "Lima, Perú" },
  { name: "Bogotá", country: "Colombia", display: "Bogotá, Colombia" },
  { name: "Santiago", country: "Chile", display: "Santiago, Chile" },
  { name: "Caracas", country: "Venezuela", display: "Caracas, Venezuela" },
  { name: "Barcelona", country: "España", state: "Cataluña", display: "Barcelona, España" },
  { name: "Montevideo", country: "Uruguay", display: "Montevideo, Uruguay" },
  { name: "São Paulo", country: "Brasil", display: "São Paulo, Brasil" },
]
