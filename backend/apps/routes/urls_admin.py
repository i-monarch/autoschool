from django.urls import path
from . import views_admin as views

urlpatterns = [
    path('centers/', views.AdminCenterListCreateView.as_view()),
    path('centers/<int:pk>/', views.AdminCenterDetailView.as_view()),
    path('routes/', views.AdminRouteListCreateView.as_view()),
    path('routes/<int:pk>/', views.AdminRouteDetailView.as_view()),
]
