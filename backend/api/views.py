from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from django.conf import settings
import requests
from .models import Plant
from .serializers import PlantSerializer, PlantDetailSerializer

@api_view(["GET"])
def geocode(request):
    """
    GET /api/geocode/?q=<texto>
    Usa OpenWeather Geocoding API para sugerir ciudades.
    """
    q = request.query_params.get("q", "")
    if len(q) < 2:
        return Response([], status=status.HTTP_200_OK)
    api_key = settings.OPENWEATHER_API_KEY
    if not api_key:
        return Response({"detail": "API key no configurada"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    # Llamada a OpenWeather Geocoding (limit=5)
    url = "http://api.openweathermap.org/geo/1.0/direct"
    params = {"q": q, "limit": 5, "appid": api_key}
    try:
        resp = requests.get(url, params=params, timeout=5)
        if resp.status_code != 200:
            return Response([], status=status.HTTP_200_OK)
        data = resp.json()  # lista de objetos con name, lat, lon, country, state (opcional)
    except requests.RequestException:
        return Response([], status=status.HTTP_200_OK)
    # Transformar a formato de CityOption que espera el frontend
    results = []
    for item in data:
        name = item.get("name")
        country = item.get("country")
        state = item.get("state")
        lat = item.get("lat")
        lon = item.get("lon")
        # Construir display, p.e.: "Buenos Aires, Argentina"
        display = name
        if state:
            display += f", {state}"
        if country:
            display += f", {country}"
        results.append({
            "name": name,
            "country": country,
            "state": state or "",
            "display": display,
            "lat": lat,
            "lon": lon,
        })
    return Response(results)

@api_view(["GET"])
def plant_list(request):
    plants = Plant.objects.all()
    serializer = PlantSerializer(plants, many=True)
    return Response(serializer.data)

@api_view(["GET"])
def plant_detail(request, slug):
    plant = get_object_or_404(Plant, slug=slug)
    serializer = PlantDetailSerializer(plant)
    return Response(serializer.data)

@api_view(["POST"])
def recommend(request):
    """
    Espera JSON con { "planta": "<slug>", "ciudad": "<nombre ciudad>" }
    """
    data = request.data
    slug = data.get("planta")
    city = data.get("ciudad")
    if not slug or not city:
        return Response({"detail": "Faltan campos 'planta' o 'ciudad'."},
                        status=status.HTTP_400_BAD_REQUEST)
    
    # Obtener planta
    plant = get_object_or_404(Plant, slug=slug)

    # Llamar a OpenWeatherMap
    api_key = settings.OPENWEATHER_API_KEY
    if not api_key:
        return Response({"detail": "API key no configurada."},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    # Llamar Current Weather
    url = "https://api.openweathermap.org/data/2.5/weather"

    params = {"q": city, "appid": api_key, "units": "metric", "lang": "es"}
    try:
        resp = requests.get(url, params=params, timeout=5)
        if resp.status_code != 200:
            return Response(
                {"detail": f"Error al obtener clima: {resp.status_code}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        weather = resp.json()
        temp = weather["main"]["temp"]
        humidity = weather["main"]["humidity"]
        description = weather["weather"][0].get("description", "")
    except requests.RequestException:
        return Response({"detail": "No se pudo conectar a la API de clima."},
                        status=status.HTTP_503_SERVICE_UNAVAILABLE)
    
    # Comparar con rangos de planta
    mensajes = []
    if temp < plant.min_temp:
        mensajes.append(f"La temperatura actual ({temp}°C) está por debajo del rango ideal ({plant.min_temp}°C). Considera proteger la planta o retrasar riego.")
    elif temp > plant.max_temp:
        mensajes.append(f"La temperatura actual ({temp}°C) excede el rango ideal ({plant.max_temp}°C). Evita luz directa y controla la tierra.")
    else:
        mensajes.append(f"La temperatura actual ({temp}°C) está dentro del rango ideal ({plant.min_temp}–{plant.max_temp}°C).")
    if humidity < plant.min_humidity:
        mensajes.append(f"La humedad actual ({humidity}%) está por debajo del rango ideal ({plant.min_humidity}%). Aumenta la frecuencia de riego o humedad ambiente.")
    elif humidity > plant.max_humidity:
        mensajes.append(f"La humedad actual ({humidity}%) excede el rango ideal ({plant.max_humidity}%).")
    else:
        mensajes.append(f"La humedad actual ({humidity}%) está dentro del rango ideal ({plant.min_humidity}–{plant.max_humidity}%).")

    # Instrucciones generales
    mensajes.append(f"{plant.care_instructions}")
    recomendacion = " ".join(mensajes)
    result = {
        "temperatura": temp,
        "humedad": humidity,
        "descripcion_clima": description,
        "recomendaciones": recomendacion,
        "ciudad": city,
        "planta": plant.name,
    }
    return Response(result)
