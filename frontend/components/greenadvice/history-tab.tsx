"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { History, Leaf } from "lucide-react"
import type { HistoryItem } from "@/types"

interface HistoryTabProps {
  history: HistoryItem[]
  onHistoryItemClick: (item: HistoryItem) => void
}

export function HistoryTab({ history, onHistoryItemClick }: HistoryTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Historial de Consultas
        </CardTitle>
        <CardDescription>Tus últimas recomendaciones generadas</CardDescription>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No tienes consultas en tu historial aún.</p>
        ) : (
          <div className="space-y-3">
            {history.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => onHistoryItemClick(item)}
              >
                <div className="flex items-center gap-3">
                  <Leaf className="h-4 w-4 text-green-600" />
                  <div>
                    <span className="font-medium">{item.plant}</span>
                    <span className="text-gray-500 mx-2">en</span>
                    <span className="font-medium">{item.city}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-gray-600">
                    {item.temperature}°C, {item.humidity}%
                  </div>
                  <div className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
