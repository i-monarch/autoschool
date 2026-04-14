from django.urls import path
from . import views

urlpatterns = [
    path('dashboard/', views.MotivationDashboardView.as_view()),
    path('achievements/', views.AchievementsView.as_view()),
    path('daily-goal/', views.DailyGoalView.as_view()),
    path('weekly/', views.WeeklyActivityView.as_view()),
]
