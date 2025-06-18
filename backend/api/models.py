from django.db import models

class Plant(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    min_temp = models.FloatField(help_text="Temperatura mínima ideal (°C)")
    max_temp = models.FloatField(help_text="Temperatura máxima ideal (°C)")
    min_humidity = models.FloatField(help_text="Humedad mínima ideal (%)")
    max_humidity = models.FloatField(help_text="Humedad máxima ideal (%)")
    care_instructions = models.TextField(help_text="Instrucciones generales de cuidado")

    def __str__(self):
        return self.name
