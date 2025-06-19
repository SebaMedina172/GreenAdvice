import { MOCK_CITIES } from "@/lib/constants"
import type { CityOption } from "@/types"

export const cityService = {
  async searchCities(query: string): Promise<CityOption[]> {
    if (query.length < 2) return []

    // Simulación de búsqueda - reemplaza con tu API real
    return new Promise((resolve) => {
      setTimeout(() => {
        const filtered = MOCK_CITIES.filter(
          (city) =>
            city.name.toLowerCase().includes(query.toLowerCase()) ||
            city.country.toLowerCase().includes(query.toLowerCase()),
        )
        resolve(filtered)
      }, 300)
    })
  },
}
