from django.urls import path

from . import views_admin as views

urlpatterns = [
    path('tariffs/', views.AdminTariffListCreateView.as_view()),
    path('tariffs/<int:pk>/', views.AdminTariffDetailView.as_view()),
    path('tariffs/reorder/', views.AdminTariffReorderView.as_view()),
    path('tariffs/stats/', views.AdminTariffStatsView.as_view()),
]
