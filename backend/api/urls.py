from django.urls import path
from . import views

urlpatterns = [
    path("plants/", views.plant_list, name="plant-list"),
    path("plants/<slug:slug>/", views.plant_detail, name="plant-detail"),
    path("recommend/", views.recommend, name="recommend"),
]

