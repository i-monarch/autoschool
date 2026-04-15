from django.urls import path
from . import views_admin as views

urlpatterns = [
    path('stats/', views.AdminScheduleStatsView.as_view()),
    path('teachers/', views.AdminTeachersListView.as_view()),
    path('slots/', views.AdminSlotListCreateView.as_view()),
    path('slots/<int:pk>/', views.AdminSlotDetailView.as_view()),
    path('slots/<int:pk>/cancel/', views.AdminCancelSlotView.as_view()),
    path('slots/<int:pk>/restore/', views.AdminRestoreSlotView.as_view()),
]
