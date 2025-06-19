import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sun } from "lucide-react"
import { processRecommendations } from "@/lib/utils/recommendations"
import type { ApiResponse } from "@/types"

interface RecommendationsCardProps {
  recommendation: ApiResponse
}

export function RecommendationsCard({ recommendation }: RecommendationsCardProps) {
  const { alerts, recommendations } = processRecommendations(recommendation.recomendaciones)

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="h-5 w-5" />
          Recomendaciones Personalizadas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-red-600">⚠️ Alertas importantes:</h4>
            <ul className="space-y-1">
              {alerts.map((alert, index) => (
                <li key={index} className="text-sm bg-red-50 p-2 rounded border-l-4 border-red-400">
                  {alert}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-2">
          <h4 className="font-medium text-green-600">💡 Consejos de cuidado:</h4>
          <ul className="space-y-1">
            {recommendations.map((rec, index) => (
              <li key={index} className="text-sm bg-green-50 p-2 rounded border-l-4 border-green-400">
                {rec}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
