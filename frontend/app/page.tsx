"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Leaf, MapPin, Thermometer, Sun, Heart, History, Search, X, Loader2, Droplets } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Toaster } from "@/components/ui/toaster"

// Configuración de la API - Mantiene tu estructura actual
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const RECOMMEND_ENDPOINT = "/api/recommend/"
const PLANTS_ENDPOINT = "/api/plants/"

// Interfaces adaptadas para tu API actual
interface ApiResponse {
  temperatura: number
  humedad: number
  recomendaciones: string
  ciudad: string
  planta: string
  descripcion_clima?: string
}

// Interfaces del nuevo diseño (adaptadas)
interface Plant {
  value: string
  label: string
}

interface FavoriteCity {
  name: string
  country: string
  addedAt: string
}

interface HistoryItem {
  plant: string
  city: string
  date: string
  temperature: number
  humidity: number
}

interface CityOption {
  name: string
  country: string
  state?: string
  display: string
}

// Función para procesar las recomendaciones de texto a arrays
const processRecommendations = (text: string) => {
  const alerts: string[] = [];
  const recommendations: string[] = [];
  
  // Función para dividir texto en oraciones respetando números decimales y rangos
  const splitIntoSentences = (text: string) => {
    // Reemplazar temporalmente puntos en números y rangos
    let processedText = text
      .replace(/(\d+)\.(\d+)/g, '$1DECIMAL$2') // 13.82 -> 13DECIMAL82
      .replace(/(\d+)\.(\d+)°C/g, '$1DECIMAL$2°C') // 13.82°C -> 13DECIMAL82°C
      .replace(/(\d+)\.(\d+)%/g, '$1DECIMAL$2%') // 50.0% -> 50DECIMAL0%
      .replace(/(\d+)\.(\d+)–(\d+)\.(\d+)/g, '$1DECIMAL$2–$3DECIMAL$4'); // rangos como 10.0–29.0
    
    // Dividir por puntos seguidos de espacio y mayúscula, o final de línea
    const sentences = processedText.split(/\.\s+(?=[A-Z])|\.$/);
    
    // Restaurar los puntos decimales
    return sentences
      .map(sentence => sentence.replace(/DECIMAL/g, '.').trim())
      .filter(sentence => sentence.length > 5);
  };
  
  // Dividir por líneas primero
  const lines = text.split(/\r\n|\n/).filter(line => line.trim());
  
  lines.forEach(line => {
    const cleanLine = line.trim();
    if (cleanLine.length === 0) return;
    
    // Dividir la línea en oraciones
    const sentences = splitIntoSentences(cleanLine);
    
    sentences.forEach(sentence => {
      const cleanSentence = sentence.trim();
      if (cleanSentence.length === 0) return;
      
      // Palabras clave para alertas (condiciones fuera de rango o problemas)
      const alertKeywords = [
        'excede', 'supera', 'por encima', 'muy alta', 'muy baja', 'fuera del rango',
        'no está dentro', 'por debajo', 'insuficiente', 'demasiado',
        'evita', 'evitar', 'no debes', 'no exponer', 'riesgo', 'peligro',
        'cuidado', 'atención', 'importante', 'precaución', 'advertencia',
        'no tolera', 'puede dañar', 'daño', 'quemaduras'
      ];
      
      // Palabras clave para condiciones positivas
      const positiveKeywords = [
        'dentro del rango ideal', 'está dentro del rango', 'rango ideal', 
        'está bien', 'perfecto', 'adecuado', 'correcto', 'óptimo', 'apropiado'
      ];
      
      const lowerSentence = cleanSentence.toLowerCase();
      
      // Verificar si contiene palabras de alerta
      const hasAlert = alertKeywords.some(keyword => lowerSentence.includes(keyword));
      
      // Verificar si es una condición positiva
      const isPositive = positiveKeywords.some(keyword => lowerSentence.includes(keyword));
      
      // Asegurar que termine con punto
      const finalSentence = cleanSentence + (cleanSentence.endsWith('.') ? '' : '.');
      
      // Si contiene alerta, va a alertas
      if (hasAlert) {
        alerts.push(finalSentence);
      } 
      // Si es positivo Y no tiene alertas, va a recomendaciones
      else if (isPositive) {
        recommendations.push(finalSentence);
      }
      // Si no es ni alerta ni positivo, es una recomendación general
      else {
        recommendations.push(finalSentence);
      }
    });
  });
  
  return { alerts, recommendations };
};

export default function PlantCareRecommender() {
  // Estados principales
  const [plants, setPlants] = useState<Plant[]>([])
  const [selectedPlant, setSelectedPlant] = useState<string>("")
  const [city, setCity] = useState<string>("")
  const [recommendation, setRecommendation] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")
  
  // Estados para plantas
  const [plantsLoading, setPlantsLoading] = useState<boolean>(false)
  const [plantsError, setPlantsError] = useState<string>("")
  
  // Estados del nuevo diseño
  const [favoriteCities, setFavoriteCities] = useState<FavoriteCity[]>([])
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [cityOptions, setCityOptions] = useState<CityOption[]>([])
  const [showCityDropdown, setShowCityDropdown] = useState(false)
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(null)
  const [citySearchLoading, setCitySearchLoading] = useState(false)
  const cityInputRef = useRef<HTMLInputElement>(null)

  const { toast } = useToast()

  // Función auxiliar para mostrar mensajes
  const showToast = (title: string, description: string, variant: "default" | "destructive") => {
    toast({
      title,
      description,
      variant,
      duration: variant === "destructive" ? 5000 : 3000, // Errores duran más tiempo
    })
  }

  useEffect(() => {
    fetchPlants()
    loadFavoriteCities()
    loadHistory()
  }, [])

  // Función para cargar plantas
  const fetchPlants = async () => {
    setPlantsLoading(true)
    setPlantsError("")
    try {
      const response = await fetch(`${API_BASE_URL}${PLANTS_ENDPOINT}`)
      if (!response.ok) throw new Error(`Error ${response.status}`)
      const data: Plant[] = await response.json()
      setPlants(data)
    } catch (e) {
      console.error("Error cargando plantas:", e)
      setPlantsError("No se pudo cargar la lista de plantas")
      showToast("Error", "No se pudieron cargar las plantas", "destructive")
    } finally {
      setPlantsLoading(false)
    }
  }

  // Funciones de almacenamiento local
  const loadFavoriteCities = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("favoriteCities")
      if (saved) {
        setFavoriteCities(JSON.parse(saved))
      }
    }
  }

  const loadHistory = () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("consultHistory")
      if (saved) {
        setHistory(JSON.parse(saved))
      }
    }
  }

  // Simulación de búsqueda de ciudades
  const searchCities = async (query: string) => {
    if (query.length < 2) {
      setCityOptions([])
      setShowCityDropdown(false)
      return
    }

    setCitySearchLoading(true)
    
    // Simulación de ciudades populares - reemplaza con tu API real
    const mockCities = [
      { name: "Buenos Aires", country: "Argentina", state: "Buenos Aires", display: "Buenos Aires, Argentina" },
      { name: "Madrid", country: "España", display: "Madrid, España" },
      { name: "Ciudad de México", country: "México", display: "Ciudad de México, México" },
      { name: "Lima", country: "Perú", display: "Lima, Perú" },
      { name: "Bogotá", country: "Colombia", display: "Bogotá, Colombia" },
      { name: "Santiago", country: "Chile", display: "Santiago, Chile" },
      { name: "Caracas", country: "Venezuela", display: "Caracas, Venezuela" },
      { name: "Barcelona", country: "España", state: "Cataluña", display: "Barcelona, España" },
      { name: "Montevideo", country: "Uruguay", display: "Montevideo, Uruguay" },
      { name: "São Paulo", country: "Brasil", display: "São Paulo, Brasil" },
    ]
    
    setTimeout(() => {
      const filtered = mockCities.filter(city => 
        city.name.toLowerCase().includes(query.toLowerCase()) ||
        city.country.toLowerCase().includes(query.toLowerCase())
      )
      setCityOptions(filtered)
      setShowCityDropdown(filtered.length > 0)
      setCitySearchLoading(false)
    }, 300)
  }

  const handleCitySelect = (cityOption: CityOption) => {
    setSelectedCity(cityOption)
    setCity(cityOption.display)
    setShowCityDropdown(false)
    setCityOptions([])
  }

  const handleCityInputChange = (value: string) => {
    setCity(value)
    setSelectedCity(null)
    searchCities(value)
  }

  const clearCitySelection = () => {
    setCity("")
    setSelectedCity(null)
    setShowCityDropdown(false)
    setCityOptions([])
    cityInputRef.current?.focus()
    showToast("Búsqueda limpiada", "Puedes buscar una nueva ciudad", "default")
  }

  const saveFavoriteCity = () => {
    if (!selectedCity || typeof window === 'undefined') return

    const newFavorite: FavoriteCity = {
      name: selectedCity.name,
      country: selectedCity.country,
      addedAt: new Date().toISOString(),
    }
    
    const updated = [...favoriteCities.filter((f) => f.name !== selectedCity.name), newFavorite]
    setFavoriteCities(updated)
    localStorage.setItem("favoriteCities", JSON.stringify(updated))
    showToast("¡Ciudad guardada!", `${selectedCity.name} se agregó a tus favoritos`, "default")
  }

  const saveToHistory = (plant: string, city: string, temperature: number, humidity: number) => {
    if (typeof window === 'undefined') return

    const newItem: HistoryItem = {
      plant,
      city,
      date: new Date().toISOString(),
      temperature,
      humidity,
    }
    const updated = [newItem, ...history.slice(0, 9)] // Mantener solo 10 elementos
    setHistory(updated)
    localStorage.setItem("consultHistory", JSON.stringify(updated))
  }

  // Función principal para obtener recomendación 
  const getRecommendation = async () => {
    if (!selectedPlant || !city.trim()) {
      setError("Por favor selecciona una planta e ingresa una ciudad")
      showToast("Campos requeridos", "Selecciona una planta y escribe el nombre de una ciudad", "destructive")
      return
    }

    showToast("Generando recomendación...", "Analizando condiciones climáticas", "default")

    setLoading(true)
    setError("")
    setRecommendation(null)
    
    try {
      const payload = {
        planta: selectedPlant,
        ciudad: city.trim(),
      }

      const response = await fetch(`${API_BASE_URL}${RECOMMEND_ENDPOINT}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data: ApiResponse = await response.json()
      setRecommendation(data)

      // Guardar en historial
      const plant = plants.find((p) => p.value === selectedPlant)
      if (plant) {
        saveToHistory(plant.label, data.ciudad, data.temperatura, data.humedad)
      }

      showToast("¡Recomendación lista!", `Consejos generados para ${plant?.label} en ${data.ciudad}`, "default")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al obtener recomendaciones"
      setError(errorMessage)
      showToast("Error al generar recomendación", "Verifica tu conexión e intenta nuevamente", "destructive")
      console.error("Error en la solicitud:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleFavoriteCityClick = (fav: FavoriteCity) => {
    const cityDisplay = `${fav.name}, ${fav.country}`
    setCity(cityDisplay)
    setSelectedCity({
      name: fav.name,
      country: fav.country,
      display: cityDisplay,
    })
    showToast("Ciudad seleccionada", `Usando ${fav.name} como ubicación`, "default")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="h-8 w-8 text-green-600" />
            <h1 className="text-4xl font-bold text-gray-800">PlantCare AI</h1>
          </div>
          <p className="text-lg text-gray-600">
            Recomendaciones personalizadas de cuidado de plantas según el clima de tu ciudad
          </p>
        </div>

        <Tabs defaultValue="recommender" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recommender">Recomendador</TabsTrigger>
            <TabsTrigger value="favorites">Favoritos</TabsTrigger>
            <TabsTrigger value="history">Historial</TabsTrigger>
          </TabsList>

          <TabsContent value="recommender" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5" />
                  Selecciona tu planta y ciudad
                </CardTitle>
                <CardDescription>
                  Obtén recomendaciones personalizadas basadas en las condiciones climáticas actuales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Planta</label>
                    <Select value={selectedPlant} onValueChange={setSelectedPlant}>
                      <SelectTrigger>
                        <SelectValue placeholder={plants.length ? "Selecciona una planta" : plantsLoading ? "Cargando..." : "Sin opciones"} />
                      </SelectTrigger>
                      <SelectContent>
                        {plantsLoading ? (
                          <SelectItem disabled value="loading">Cargando...</SelectItem>
                        ) : plantsError ? (
                          <SelectItem disabled value="error">{plantsError}</SelectItem>
                        ) : plants.length ? (
                          plants.map((plant) => (
                            <SelectItem key={plant.value} value={plant.value}>
                              <div className="flex flex-col">
                                <span className="font-medium">{plant.label}</span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem disabled value="no-plants">Sin plantas disponibles</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ciudad</label>
                    <div className="relative">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Input
                            ref={cityInputRef}
                            placeholder="Buscar ciudad..."
                            value={city}
                            onChange={(e) => handleCityInputChange(e.target.value)}
                            onKeyPress={(e) => e.key === "Enter" && getRecommendation()}
                            className={selectedCity ? "pr-8" : ""}
                          />
                          {citySearchLoading && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              <Search className="h-4 w-4 animate-spin" />
                            </div>
                          )}
                          {selectedCity && (
                            <button
                              onClick={clearCitySelection}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          )}

                          {showCityDropdown && cityOptions.length > 0 && (
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
                        <Button onClick={getRecommendation} disabled={loading}>
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Analizando...
                            </>
                          ) : (
                            "Analizar"
                          )}
                        </Button>
                      </div>
                      {selectedCity && (
                        <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {selectedCity.display}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {favoriteCities.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ciudades favoritas</label>
                    <div className="flex flex-wrap gap-2">
                      {favoriteCities.map((fav, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="cursor-pointer hover:bg-gray-100"
                          onClick={() => handleFavoriteCityClick(fav)}
                        >
                          <MapPin className="h-3 w-3 mr-1" />
                          {fav.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Área de error */}
            {error && (
              <Alert className="border-red-300 bg-red-50">
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            {recommendation && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Thermometer className="h-5 w-5" />
                        Condiciones Climáticas
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={saveFavoriteCity}
                        disabled={!selectedCity}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Ubicación</span>
                      <span className="font-medium">{recommendation.ciudad}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Temperatura</span>
                      <span className="font-medium">{recommendation.temperatura}°C</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Humedad</span>
                      <span className="font-medium">{recommendation.humedad}%</span>
                    </div>
                    {recommendation.descripcion_clima && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Condición</span>
                        <span className="font-medium">{recommendation.descripcion_clima}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>

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

                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sun className="h-5 w-5" />
                      Recomendaciones Personalizadas
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {(() => {
                      const { alerts, recommendations } = processRecommendations(recommendation.recomendaciones);
                      return (
                        <>
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
                        </>
                      );
                    })()}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites">
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
                      <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleFavoriteCityClick(fav)}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">{fav.name}</h3>
                              <p className="text-sm text-gray-500">{fav.country}</p>
                            </div>
                            <MapPin className="h-5 w-5 text-gray-400" />
                          </div>
                          <p className="text-xs text-gray-400 mt-2">
                            Agregada: {new Date(fav.addedAt).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
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
                        onClick={() => {
                          setSelectedPlant(plants.find((p) => p.label === item.plant)?.value || "")
                          setCity(item.city)
                          setSelectedCity({
                            name: item.city.split(",")[0],
                            country: item.city.split(",")[1]?.trim() || "",
                            display: item.city,
                          })
                          showToast("Configuración restaurada", `Usando ${item.plant} en ${item.city}`, "default")
                        }}
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
          </TabsContent>
        </Tabs>
        <Toaster />
      </div>
    </div>
  )
}