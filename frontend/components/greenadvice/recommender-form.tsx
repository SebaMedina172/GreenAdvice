"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Leaf, Loader2 } from "lucide-react"
import { PlantSelector } from "./plant-selector"
import { CitySearch } from "./city-search"
import { FavoriteCities } from "./favorite-cities"
import type { Plant, FavoriteCity, CityOption } from "@/types"

interface RecommenderFormProps {
  plants: Plant[]
  plantsLoading: boolean
  plantsError: string
  selectedPlant: string
  city: string
  selectedCity: CityOption | null
  favoriteCities: FavoriteCity[]
  loading: boolean
  onPlantChange: (value: string) => void
  onCityChange: (city: string) => void
  onCitySelect: (city: CityOption) => void
  onCityClear: () => void
  onFavoriteCityClick: (city: FavoriteCity) => void
  onSubmit: () => void
}

export function RecommenderForm({
  plants,
  plantsLoading,
  plantsError,
  selectedPlant,
  city,
  selectedCity,
  favoriteCities,
  loading,
  onPlantChange,
  onCityChange,
  onCitySelect,
  onCityClear,
  onFavoriteCityClick,
  onSubmit,
}: RecommenderFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-5 w-5" />
          Selecciona tu planta y ciudad
        </CardTitle>
        <CardDescription>
          Obtén recomendaciones personalizadas basadas en las condiciones climáticas actuales
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <PlantSelector
            plants={plants}
            selectedPlant={selectedPlant}
            onPlantChange={onPlantChange}
            loading={plantsLoading}
            error={plantsError}
          />

          <div className="space-y-2">
            <CitySearch
              city={city}
              selectedCity={selectedCity}
              onCityChange={onCityChange}
              onCitySelect={onCitySelect}
              onClear={onCityClear}
              onEnterPress={onSubmit}
            />
            <div className="flex justify-end">
              <Button onClick={onSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analizando...
                  </>
                ) : (
                  "Analizar"
                )}
              </Button>
            </div>
          </div>
        </div>

        <FavoriteCities favoriteCities={favoriteCities} onCityClick={onFavoriteCityClick} />
      </CardContent>
    </Card>
  )
}
