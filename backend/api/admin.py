from django.contrib import admin
from .models import Plant

@admin.register(Plant)
class PlantAdmin(admin.ModelAdmin):
    list_display = ("name", "min_temp", "max_temp", "min_humidity", "max_humidity")
    prepopulated_fields = {"slug": ("name",)}
