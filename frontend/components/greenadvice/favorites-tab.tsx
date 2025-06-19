"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Heart, MapPin } from "lucide-react"
import type { FavoriteCity } from "@/types"

interface FavoritesTabProps {
  favoriteCities: FavoriteCity[]
  onCityClick: (city: FavoriteCity) => void
}

export function FavoritesTab({ favoriteCities, onCityClick }: FavoritesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Ciudades Favoritas
        </CardTitle>
        <CardDescription>Tus ubicaciones guardadas para consultas rápidas</CardDescription>
      </CardHeader>
      <CardContent>
        {favoriteCities.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No tienes ciudades favoritas aún. Guarda una ciudad desde el recomendador.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {favoriteCities.map((fav, index) => (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onCityClick(fav)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{fav.name}</h3>
                      <p className="text-sm text-gray-500">{fav.country}</p>
                    </div>
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Agregada: {new Date(fav.addedAt).toLocaleDateString()}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
