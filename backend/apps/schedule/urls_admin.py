from django.urls import path
from . import views_admin as views

urlpatterns = [
    path('stats/', views.AdminScheduleStatsView.as_view()),
    path('slots/', views.AdminSlotListView.as_view()),
    path('slots/<int:pk>/', views.AdminSlotDetailView.as_view()),
]
