"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Heart, MapPin, X } from "lucide-react"
import type { FavoriteCity } from "@/types"

interface FavoritesTabProps {
  favoriteCities: FavoriteCity[]
  onCityClick: (city: FavoriteCity) => void
  onRemoveCity: (cityName: string) => void
}

export function FavoritesTab({ favoriteCities, onCityClick, onRemoveCity }: FavoritesTabProps) {
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
                className="hover:shadow-md transition-shadow relative group"
              >
                <CardContent className="p-4">
                  <div className="cursor-pointer" onClick={() => onCityClick(fav)}>
                    <div>
                      <h3 className="font-medium">{fav.name}</h3>
                      <p className="text-sm text-gray-500">{fav.country}</p>
                    </div>
                    <MapPin className="h-5 w-5 text-gray-400" />
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      onRemoveCity(fav.name)
                    }}
                    className="absolute top-2 right-2 p-1 rounded-full bg-red-100 text-red-600 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-200"
                    title="Eliminar de favoritos"
                  >
                    <X className="h-3 w-3" />
                  </button>
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
