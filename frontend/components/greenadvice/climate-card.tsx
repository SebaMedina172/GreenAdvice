"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Thermometer, Heart } from "lucide-react"
import type { ApiResponse, CityOption } from "@/types"

interface ClimateCardProps {
  recommendation: ApiResponse
  selectedCity: CityOption | null
  onSaveFavorite: () => void
}

export function ClimateCard({ recommendation, selectedCity, onSaveFavorite }: ClimateCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Condiciones Climáticas
          </span>
          <Button variant="outline" size="sm" onClick={onSaveFavorite} disabled={!selectedCity}>
            <Heart className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Ubicación</span>
          <span className="font-medium">{recommendation.ciudad}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Temperatura</span>
          <span className="font-medium">{recommendation.temperatura}°C</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Humedad</span>
          <span className="font-medium">{recommendation.humedad}%</span>
        </div>
        {recommendation.descripcion_clima && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Condición</span>
            <span className="font-medium">{recommendation.descripcion_clima}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
