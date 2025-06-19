import { API_BASE_URL } from "@/lib/constants"
import type { CityOption } from "@/types"

export const cityService = {
  async searchCities(query: string): Promise<CityOption[]> {
    if (query.length < 2) return []
    try {
      const res = await fetch(`${API_BASE_URL}/api/geocode/?q=${encodeURIComponent(query)}`)
      if (!res.ok) {
        console.error("geocode error status:", res.status)
        return []
      }
      const data = await res.json()
      return data
    } catch (e) {
      console.error("Error searching cities:", e)
      return []
    }
  },
}

