"use client"

import { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { MapPin, Search, X } from "lucide-react"
import { cityService } from "@/lib/services/cities"
import type { CityOption } from "@/types"

interface CitySearchProps {
  city: string
  selectedCity: CityOption | null
  onCityChange: (city: string) => void
  onCitySelect: (city: CityOption) => void
  onClear: () => void
  onEnterPress: () => void
}

export function CitySearch({ city, selectedCity, onCityChange, onCitySelect, onClear, onEnterPress }: CitySearchProps) {
  const [cityOptions, setCityOptions] = useState<CityOption[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const searchCities = async (query: string) => {
    if (query.length < 2) {
      setCityOptions([])
      setShowDropdown(false)
      return
    }

    setLoading(true)
    try {
      const results = await cityService.searchCities(query)
      setCityOptions(results)
      setShowDropdown(results.length > 0)
    } catch (error) {
      console.error("Error searching cities:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (value: string) => {
    onCityChange(value)
    searchCities(value)
  }

  const handleCitySelect = (cityOption: CityOption) => {
    onCitySelect(cityOption)
    setShowDropdown(false)
    setCityOptions([])
  }

  const handleClear = () => {
    onClear()
    setShowDropdown(false)
    setCityOptions([])
    inputRef.current?.focus()
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Ciudad</label>
      <div className="relative">
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            placeholder="Buscar ciudad..."
            value={city}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && onEnterPress()}
            className={selectedCity ? "pr-8" : ""}
          />
          {loading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <Search className="h-4 w-4 animate-spin" />
            </div>
          )}
          {selectedCity && (
            <button
              onClick={handleClear}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {showDropdown && cityOptions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
              {cityOptions.map((cityOption, index) => (
                <button
                  key={index}
                  onClick={() => handleCitySelect(cityOption)}
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{cityOption.name}</div>
                      <div className="text-sm text-gray-500">
                        {cityOption.state ? `${cityOption.state}, ` : ""}
                        {cityOption.country}
                      </div>
                    </div>
                    <MapPin className="h-4 w-4 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        {selectedCity && (
          <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {selectedCity.display}
          </div>
        )}
      </div>
    </div>
  )
}
