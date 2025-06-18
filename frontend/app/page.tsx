"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Leaf, MapPin, Thermometer, Droplets } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Configuración de la API - Modifica aquí el endpoint base
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const RECOMMEND_ENDPOINT = "/api/recommend/" // Endpoint para recomendaciones

// Tipos para la respuesta de la API - Modifica según tu estructura JSON
interface ApiResponse {
  temperatura: number
  humedad: number
  recomendaciones: string
  ciudad: string
  planta: string
}

export default function PlantCareApp() {
  // Estados del formulario
  const [selectedPlant, setSelectedPlant] = useState<string>("")
  const [city, setCity] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [result, setResult] = useState<ApiResponse | null>(null)
  const [error, setError] = useState<string>("")
  const [plants, setPlants] = useState<{ value: string; label: string }[]>([])
  const [plantsLoading, setPlantsLoading] = useState<boolean>(false)
  const [plantsError, setPlantsError] = useState<string>("")

  useEffect(() => {
    async function fetchPlants() {
      setPlantsLoading(true)
      setPlantsError("")
      try {
        const res = await fetch(`${API_BASE_URL}/api/plants/`)
        if (!res.ok) throw new Error(`Error ${res.status}`)
        const data: { value: string; label: string }[] = await res.json()
        setPlants(data)
      } catch (e) {
        console.error("Error cargando plantas:", e)
        setPlantsError("No se pudo cargar la lista de plantas")
      } finally {
        setPlantsLoading(false)
      }
    }
    fetchPlants()
  }, [])

  // Función para hacer la solicitud a la API
  const handleGetRecommendation = async () => {
    // Validación básica
    if (!selectedPlant || !city.trim()) {
      setError("Por favor selecciona una planta e ingresa una ciudad")
      return
    }

    setIsLoading(true)
    setError("")
    setResult(null)
    
    try {
      // Estructura del payload - Modifica según lo que espere tu API Django
      const payload = {
        planta: selectedPlant,
        ciudad: city.trim(),
      }

      const response = await fetch(`${API_BASE_URL}${RECOMMEND_ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Agrega aquí headers adicionales si necesitas autenticación
          // 'Authorization': 'Bearer your-token',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data: ApiResponse = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener recomendaciones")
      console.error("Error en la solicitud:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center py-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-green-800">PlantCare</h1>
          </div>
          <p className="text-green-700 text-lg">Recomendaciones personalizadas para el cuidado de tus plantas</p>
        </div>

        {/* Formulario principal */}
        <Card className="shadow-lg border-green-200">
          <CardHeader className="bg-green-50 border-b border-green-200">
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Leaf className="h-5 w-5" />
              Obtener Recomendación
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {/* Selector de planta */}
            <div className="space-y-2">
              <Label htmlFor="plant-select" className="text-green-700 font-medium">
                Selecciona tu planta
              </Label>
              <Select value={selectedPlant} onValueChange={setSelectedPlant}>
                <SelectTrigger className="border-green-300 focus:border-green-500">
                  <SelectValue placeholder={plants.length ? "Elige una planta..." : plantsLoading ? "Cargando..." : "Sin opciones"} />
                </SelectTrigger>
                <SelectContent>
                  {plantsLoading ? (
                    <SelectItem disabled value="">{`Cargando...`}</SelectItem>
                  ) : plantsError ? (
                    <SelectItem disabled value="">{plantsError}</SelectItem>
                  ) : plants.length ? (
                    plants.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem disabled value="">{`Sin plantas disponibles`}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Campo de ciudad */}
            <div className="space-y-2">
              <Label htmlFor="city-input" className="text-green-700 font-medium">
                Ciudad
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-green-500" />
                <Input
                  id="city-input"
                  type="text"
                  placeholder="Ingresa tu ciudad..."
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="pl-10 border-green-300 focus:border-green-500"
                />
              </div>
            </div>

            {/* Botón de envío */}
            <Button
              onClick={handleGetRecommendation}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-medium"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Obteniendo recomendación...
                </>
              ) : (
                "Obtener Recomendación"
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Área de error */}
        {error && (
          <Alert className="border-red-300 bg-red-50">
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {/* Área de resultados */}
        {result && (
          <Card className="shadow-lg border-amber-200">
            <CardHeader className="bg-amber-50 border-b border-amber-200">
              <CardTitle className="text-amber-800 flex items-center gap-2">
                <Leaf className="h-5 w-5" />
                Recomendaciones para {result.planta} en {result.ciudad}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Información del clima */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <Thermometer className="h-6 w-6 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-700 font-medium">Temperatura</p>
                    <p className="text-xl font-bold text-blue-800">{result.temperatura}°C</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                  <Droplets className="h-6 w-6 text-cyan-600" />
                  <div>
                    <p className="text-sm text-cyan-700 font-medium">Humedad</p>
                    <p className="text-xl font-bold text-cyan-800">{result.humedad}%</p>
                  </div>
                </div>
              </div>

              {/* Recomendaciones */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-800 mb-2">Recomendaciones de cuidado:</h3>
                <p className="text-green-700 leading-relaxed">{result.recomendaciones}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
