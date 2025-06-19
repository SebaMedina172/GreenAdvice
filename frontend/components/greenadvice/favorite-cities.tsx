"use client"

import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"
import type { FavoriteCity } from "@/types"

interface FavoriteCitiesProps {
  favoriteCities: FavoriteCity[]
  onCityClick: (city: FavoriteCity) => void
}

export function FavoriteCities({ favoriteCities, onCityClick }: FavoriteCitiesProps) {
  if (favoriteCities.length === 0) return null

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Ciudades favoritas</label>
      <div className="flex flex-wrap gap-2">
        {favoriteCities.map((fav, index) => (
          <Badge
            key={index}
            variant="outline"
            className="cursor-pointer hover:bg-gray-100"
            onClick={() => onCityClick(fav)}
          >
            <MapPin className="h-3 w-3 mr-1" />
            {fav.name}
          </Badge>
        ))}
      </div>
    </div>
  )
}
