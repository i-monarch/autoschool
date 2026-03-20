from django.urls import path
from . import views
from . import views_extra

urlpatterns = [
    path('categories/', views.CategoryListView.as_view()),
    path('start/', views.StartTestView.as_view()),
    path('attempts/<int:attempt_id>/answer/', views.SubmitAnswerView.as_view()),
    path('attempts/<int:attempt_id>/finish/', views.FinishTestView.as_view()),
    path('attempts/', views.AttemptListView.as_view()),
    path('attempts/<int:pk>/', views.AttemptDetailView.as_view()),
    path('stats/', views.TestStatsView.as_view()),
    path('wrong-answers/', views.WrongAnswersView.as_view()),
    path('saved/', views_extra.SavedQuestionToggleView.as_view()),
    path('saved/list/', views_extra.SavedQuestionListView.as_view()),
    path('questions/<int:question_id>/comments/', views_extra.QuestionCommentListCreateView.as_view()),
    path('leaderboard/', views_extra.LeaderboardView.as_view()),
]
