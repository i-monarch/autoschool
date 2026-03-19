from django.urls import path
from . import views

urlpatterns = [
    path('categories/', views.CategoryListView.as_view()),
    path('start/', views.StartTestView.as_view()),
    path('attempts/<int:attempt_id>/answer/', views.SubmitAnswerView.as_view()),
    path('attempts/<int:attempt_id>/finish/', views.FinishTestView.as_view()),
    path('attempts/', views.AttemptListView.as_view()),
    path('attempts/<int:pk>/', views.AttemptDetailView.as_view()),
    path('stats/', views.TestStatsView.as_view()),
    path('wrong-answers/', views.WrongAnswersView.as_view()),
]
