// Interfaces de la API
export interface ApiResponse {
  temperatura: number
  humedad: number
  recomendaciones: string
  ciudad: string
  planta: string
  descripcion_clima?: string
  planta_temp_min: number
  planta_temp_max: number
  planta_humedad_min: number
  planta_humedad_max: number
  planta_light_requirement?: string
  planta_watering_frequency?: string
}

// Interfaces de la aplicación
export interface Plant {
  value: string
  label: string
}

export interface FavoriteCity {
  name: string
  country: string
  addedAt: string
}

export interface HistoryItem {
  plant: string
  city: string
  date: string
  temperature: number
  humidity: number
}

export interface CityOption {
  name: string
  country: string
  state?: string
  display: string
  lat?: number
  lon?: number
}
