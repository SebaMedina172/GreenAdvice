import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Thermometer, Droplets } from "lucide-react"
import type { ApiResponse } from "@/types"

interface PlantInfoCardProps {
  recommendation: ApiResponse
}

export function PlantInfoCard({ recommendation }: PlantInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Leaf className="h-5 w-5" />
          {recommendation.planta}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <Thermometer className="h-6 w-6 text-blue-600" />
            <div>
              <p className="text-sm text-blue-700 font-medium">Temperatura</p>
              <p className="text-xl font-bold text-blue-800">{recommendation.temperatura}°C</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
            <Droplets className="h-6 w-6 text-cyan-600" />
            <div>
              <p className="text-sm text-cyan-700 font-medium">Humedad</p>
              <p className="text-xl font-bold text-cyan-800">{recommendation.humedad}%</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
