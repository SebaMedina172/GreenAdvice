import { API_BASE_URL, RECOMMEND_ENDPOINT, PLANTS_ENDPOINT } from "@/lib/constants"
import type { ApiResponse, Plant } from "@/types"

export const apiService = {
  async getPlants(): Promise<Plant[]> {
    const response = await fetch(`${API_BASE_URL}${PLANTS_ENDPOINT}`)
    if (!response.ok) throw new Error(`Error ${response.status}`)
    return response.json()
  },

  async getRecommendation(planta: string, ciudad: string): Promise<ApiResponse> {
    const payload = { planta, ciudad: ciudad.trim() }

    const response = await fetch(`${API_BASE_URL}${RECOMMEND_ENDPOINT}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }

    return response.json()
  },
}
