from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def health_check(request):
    """Simple health check endpoint"""
    return JsonResponse({"status": "healthy", "message": "GreenAdvice Backend is running"})

urlpatterns = [
    path("", health_check, name="health-check"),  # Root endpoint
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
]