from django.urls import path
from . import views_admin as views

urlpatterns = [
    path('regions/', views.AdminRegionListCreateView.as_view()),
    path('regions/<int:pk>/', views.AdminRegionDetailView.as_view()),
    path('centers/', views.AdminCenterListCreateView.as_view()),
    path('centers/<int:pk>/', views.AdminCenterDetailView.as_view()),
    path('routes/', views.AdminRouteListCreateView.as_view()),
    path('routes/<int:pk>/', views.AdminRouteDetailView.as_view()),
    path('images/', views.AdminImageListCreateView.as_view()),
    path('images/<int:pk>/', views.AdminImageDetailView.as_view()),
]
