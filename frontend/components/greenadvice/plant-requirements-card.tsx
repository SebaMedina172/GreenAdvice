import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Sun, Droplets, Thermometer, Wind } from "lucide-react"
import type { ApiResponse } from "@/types"

interface PlantRequirementsCardProps {
  recommendation: ApiResponse
}

export function PlantRequirementsCard({ recommendation }: PlantRequirementsCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-5 w-5" />
          Requisitos de {recommendation.planta}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <Thermometer className="h-5 w-5 text-orange-600" />
            <div>
              <p className="text-sm text-orange-700 font-medium">Temperatura Ideal</p>
              <p className="text-lg font-bold text-orange-800">
                {recommendation.planta_temp_min}°C - {recommendation.planta_temp_max}°C
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <Droplets className="h-5 w-5 text-blue-600" />
            <div>
              <p className="text-sm text-blue-700 font-medium">Humedad Ideal</p>
              <p className="text-lg font-bold text-blue-800">
                {recommendation.planta_humedad_min}% - {recommendation.planta_humedad_max}%
              </p>
            </div>
          </div>

          {recommendation.planta_luz_requerimiento && (
            <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <Sun className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-yellow-700 font-medium">Requerimiento de Luz</p>
                <p className="text-sm font-semibold text-yellow-800">{recommendation.planta_luz_requerimiento}</p>
              </div>
            </div>
          )}

          {recommendation.planta_riego_frecuencia && (
            <div className="flex items-center gap-3 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
              <Wind className="h-5 w-5 text-cyan-600" />
              <div>
                <p className="text-sm text-cyan-700 font-medium">Frecuencia de Riego</p>
                <p className="text-sm font-semibold text-cyan-800">{recommendation.planta_riego_frecuencia}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
