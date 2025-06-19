"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Plant } from "@/types"

interface PlantSelectorProps {
  plants: Plant[]
  selectedPlant: string
  onPlantChange: (value: string) => void
  loading: boolean
  error: string
}

export function PlantSelector({ plants, selectedPlant, onPlantChange, loading, error }: PlantSelectorProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Planta</label>
      <Select value={selectedPlant} onValueChange={onPlantChange}>
        <SelectTrigger>
          <SelectValue
            placeholder={plants.length ? "Selecciona una planta" : loading ? "Cargando..." : "Sin opciones"}
          />
        </SelectTrigger>
        <SelectContent>
          {loading ? (
            <SelectItem disabled value="loading">
              Cargando...
            </SelectItem>
          ) : error ? (
            <SelectItem disabled value="error">
              {error}
            </SelectItem>
          ) : plants.length ? (
            plants.map((plant) => (
              <SelectItem key={plant.value} value={plant.value}>
                <div className="flex flex-col">
                  <span className="font-medium">{plant.label}</span>
                </div>
              </SelectItem>
            ))
          ) : (
            <SelectItem disabled value="no-plants">
              Sin plantas disponibles
            </SelectItem>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
