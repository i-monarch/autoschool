from django.urls import path

from . import views

urlpatterns = [
    path('', views.AdminCityListCreateView.as_view()),
    path('<int:pk>/', views.AdminCityDetailView.as_view()),
]
