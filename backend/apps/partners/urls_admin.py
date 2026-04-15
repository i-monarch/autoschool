from django.urls import path
from . import views_admin as views

urlpatterns = [
    path('stats/', views.AdminPartnerStatsView.as_view()),
    path('', views.AdminPartnerListCreateView.as_view()),
    path('<int:pk>/', views.AdminPartnerDetailView.as_view()),
]
