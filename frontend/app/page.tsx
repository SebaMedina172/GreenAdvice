"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Leaf } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Services
import { apiService } from "@/lib/services/api"
import { storageService } from "@/lib/services/storage"

// Components
import { RecommenderForm } from "@/components/greenadvice/recommender-form"
import { ClimateCard } from "@/components/greenadvice/climate-card"
import { PlantInfoCard } from "@/components/greenadvice/plant-info-card"
import { RecommendationsCard } from "@/components/greenadvice/recommendations-card"
import { FavoritesTab } from "@/components/greenadvice/favorites-tab"
import { HistoryTab } from "@/components/greenadvice/history-tab"

// Types
import type { Plant, FavoriteCity, HistoryItem, CityOption, ApiResponse } from "@/types"

export default function PlantCareRecommender() {
  // Estados principales
  const [plants, setPlants] = useState<Plant[]>([])
  const [selectedPlant, setSelectedPlant] = useState<string>("")
  const [city, setCity] = useState<string>("")
  const [recommendation, setRecommendation] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  // Estados para plantas
  const [plantsLoading, setPlantsLoading] = useState<boolean>(false)
  const [plantsError, setPlantsError] = useState<string>("")

  // Estados del nuevo diseño
  const [favoriteCities, setFavoriteCities] = useState<FavoriteCity[]>([])
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null)

  const { toast } = useToast()

  // Función auxiliar para mostrar mensajes
  const showToast = (title: string, description: string, variant: "default" | "destructive") => {
    toast({
      title,
      description,
      variant,
      duration: variant === "destructive" ? 5000 : 3000,
    })
  }

  useEffect(() => {
    fetchPlants()
    setFavoriteCities(storageService.getFavoriteCities())
    setHistory(storageService.getHistory())
  }, [])

  // Función para cargar plantas
  const fetchPlants = async () => {
    setPlantsLoading(true)
    setPlantsError("")
    try {
      const data = await apiService.getPlants()
      setPlants(data)
    } catch (e) {
      console.error("Error cargando plantas:", e)
      setPlantsError("No se pudo cargar la lista de plantas")
      showToast("Error", "No se pudieron cargar las plantas", "destructive")
    } finally {
      setPlantsLoading(false)
    }
  }

  const handleCitySelect = (cityOption: CityOption) => {
    setSelectedCity(cityOption)
    setCity(cityOption.display)
  }

  const handleCityChange = (value: string) => {
    setCity(value)
    setSelectedCity(null)
  }

  const clearCitySelection = () => {
    setCity("")
    setSelectedCity(null)
    showToast("Búsqueda limpiada", "Puedes buscar una nueva ciudad", "default")
  }

  const saveFavoriteCity = () => {
    if (!selectedCity) return

    const newFavorite: FavoriteCity = {
      name: selectedCity.name,
      country: selectedCity.country,
      addedAt: new Date().toISOString(),
    }

    const updated = storageService.addFavoriteCity(newFavorite)
    setFavoriteCities(updated)
    showToast("¡Ciudad guardada!", `${selectedCity.name} se agregó a tus favoritos`, "default")
  }

  // Función principal para obtener recomendación
  const getRecommendation = async () => {
    if (!selectedPlant || !city.trim()) {
      setError("Por favor selecciona una planta e ingresa una ciudad")
      showToast("Campos requeridos", "Selecciona una planta y escribe el nombre de una ciudad", "destructive")
      return
    }

    showToast("Generando recomendación...", "Analizando condiciones climáticas", "default")

    setLoading(true)
    setError("")
    setRecommendation(null)

    try {
      const data = await apiService.getRecommendation(selectedPlant, city)
      setRecommendation(data)

      // Guardar en historial
      const plant = plants.find((p) => p.value === selectedPlant)
      if (plant) {
        const newHistoryItem: HistoryItem = {
          plant: plant.label,
          city: data.ciudad,
          date: new Date().toISOString(),
          temperature: data.temperatura,
          humidity: data.humedad,
        }
        const updatedHistory = storageService.addToHistory(newHistoryItem)
        setHistory(updatedHistory)
      }

      showToast("¡Recomendación lista!", `Consejos generados para ${plant?.label} en ${data.ciudad}`, "default")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al obtener recomendaciones"
      setError(errorMessage)
      showToast("Error al generar recomendación", "Verifica tu conexión e intenta nuevamente", "destructive")
      console.error("Error en la solicitud:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleFavoriteCityClick = (fav: FavoriteCity) => {
    const cityDisplay = `${fav.name}, ${fav.country}`
    setCity(cityDisplay)
    setSelectedCity({
      name: fav.name,
      country: fav.country,
      display: cityDisplay,
    })
    showToast("Ciudad seleccionada", `Usando ${fav.name} como ubicación`, "default")
  }

  const handleHistoryItemClick = async (item: HistoryItem) => {
    // Limpiar recomendaciones anteriores inmediatamente
    setRecommendation(null)
    setError("")

    // Configurar los campos
    const plantValue = plants.find((p) => p.label === item.plant)?.value || ""
    setSelectedPlant(plantValue)
    setCity(item.city)
    setSelectedCity({
      name: item.city.split(",")[0],
      country: item.city.split(",")[1]?.trim() || "",
      display: item.city,
    })

    showToast("Configuración restaurada", `Regenerando recomendaciones para ${item.plant} en ${item.city}`, "default")

    // Generar automáticamente la nueva recomendación
    if (plantValue && item.city) {
      setLoading(true)
      try {
        const data = await apiService.getRecommendation(plantValue, item.city)
        setRecommendation(data)
        showToast("¡Recomendación actualizada!", `Datos actualizados para ${item.plant} en ${data.ciudad}`, "default")
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Error al obtener recomendaciones"
        setError(errorMessage)
        showToast("Error al actualizar", "No se pudieron cargar las recomendaciones del historial", "destructive")
      } finally {
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="h-8 w-8 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-800">PlantCare AI</h1>
          </div>
          <p className="text-lg text-gray-600">
            Recomendaciones personalizadas de cuidado de plantas según el clima de tu ciudad
          </p>
        </div>

        <Tabs defaultValue="recommender" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recommender">Recomendador</TabsTrigger>
            <TabsTrigger value="favorites">Favoritos</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="recommender" className="space-y-6">
            <RecommenderForm
              plants={plants}
              plantsLoading={plantsLoading}
              plantsError={plantsError}
              selectedPlant={selectedPlant}
              city={city}
              selectedCity={selectedCity}
              favoriteCities={favoriteCities}
              loading={loading}
              onPlantChange={setSelectedPlant}
              onCityChange={handleCityChange}
              onCitySelect={handleCitySelect}
              onCityClear={clearCitySelection}
              onFavoriteCityClick={handleFavoriteCityClick}
              onSubmit={getRecommendation}
            />

            {/* Área de error */}
            {error && (
              <Alert className="border-red-300 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            {recommendation && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ClimateCard
                  recommendation={recommendation}
                  selectedCity={selectedCity}
                  onSaveFavorite={saveFavoriteCity}
                />
                <PlantInfoCard recommendation={recommendation} />
                <RecommendationsCard recommendation={recommendation} />
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites">
            <FavoritesTab favoriteCities={favoriteCities} onCityClick={handleFavoriteCityClick} />
          </TabsContent>

          <TabsContent value="history">
            <HistoryTab history={history} onHistoryItemClick={handleHistoryItemClick} />
          </TabsContent>
        </Tabs>
        <Toaster />
      </div>
    </div>
  )
}
