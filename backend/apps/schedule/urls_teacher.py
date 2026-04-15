from django.urls import path
from . import views_teacher as views

urlpatterns = [
    path('stats/', views.TeacherScheduleStatsView.as_view()),
    path('slots/', views.TeacherSlotListCreateView.as_view()),
    path('slots/<int:pk>/', views.TeacherSlotDetailView.as_view()),
    path('slots/<int:pk>/cancel/', views.TeacherCancelSlotView.as_view()),
    path('slots/<int:pk>/restore/', views.TeacherRestoreSlotView.as_view()),
]
