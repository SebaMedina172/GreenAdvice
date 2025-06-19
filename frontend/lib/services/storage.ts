import type { FavoriteCity, HistoryItem } from "@/types"

export const storageService = {
  getFavoriteCities(): FavoriteCity[] {
    if (typeof window === "undefined") return []
    const saved = localStorage.getItem("favoriteCities")
    return saved ? JSON.parse(saved) : []
  },

  saveFavoriteCities(cities: FavoriteCity[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem("favoriteCities", JSON.stringify(cities))
  },

  getHistory(): HistoryItem[] {
    if (typeof window === "undefined") return []
    const saved = localStorage.getItem("consultHistory")
    return saved ? JSON.parse(saved) : []
  },

  saveHistory(history: HistoryItem[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem("consultHistory", JSON.stringify(history))
  },

  addToHistory(item: HistoryItem): HistoryItem[] {
    const currentHistory = this.getHistory()
    const newHistory = [item, ...currentHistory.slice(0, 9)] // Mantener solo 10 elementos
    this.saveHistory(newHistory)
    return newHistory
  },

  addFavoriteCity(city: FavoriteCity): FavoriteCity[] {
    const currentFavorites = this.getFavoriteCities()
    const updated = [...currentFavorites.filter((f) => f.name !== city.name), city]
    this.saveFavoriteCities(updated)
    return updated
  },
}
