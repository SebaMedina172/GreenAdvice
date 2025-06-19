from rest_framework import serializers
from .models import Plant

class PlantSerializer(serializers.ModelSerializer):
    value = serializers.CharField(source="slug")   
    label = serializers.CharField(source="name")

    class Meta:
        model = Plant
        fields = ("value", "label")

#Si necesito mas detalles en el front
class PlantDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plant
        fields = ("id","name","slug","min_temp","max_temp","min_humidity","max_humidity","care_instructions","light_requirement", "watering_frequency",)