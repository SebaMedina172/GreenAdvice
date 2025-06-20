from django.urls import path
from django.http import JsonResponse
from . import views

def api_health(request):
    """API health check endpoint"""
    return JsonResponse({
        "status": "healthy", 
        "message": "GreenAdvice API is running",
        "endpoints": [
            "/api/plants/",
            "/api/plants/<slug>/",
            "/api/recommend/",
            "/api/geocode/"
        ]
    })

urlpatterns = [
    path("", api_health, name="api-health"),  # /api/ endpoint
    path("plants/", views.plant_list, name="plant-list"),
    path("plants/<slug:slug>/", views.plant_detail, name="plant-detail"),
    path("recommend/", views.recommend, name="recommend"),
    path("geocode/", views.geocode, name="geocode"),
]