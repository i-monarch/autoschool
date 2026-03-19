from django.urls import path
from . import views_admin as views

urlpatterns = [
    # Stats
    path('stats/', views.AdminTestStatsView.as_view()),

    # Categories
    path('categories/', views.AdminCategoryListCreateView.as_view()),
    path('categories/reorder/', views.AdminCategoryReorderView.as_view()),
    path('categories/<int:pk>/', views.AdminCategoryDetailView.as_view()),

    # Questions
    path('questions/', views.AdminQuestionListView.as_view()),
    path('questions/create/', views.AdminQuestionCreateView.as_view()),
    path('questions/<int:pk>/', views.AdminQuestionDetailView.as_view()),
    path('questions/<int:pk>/image/', views.AdminQuestionImageUploadView.as_view()),

    # Bulk
    path('questions/bulk-move/', views.AdminBulkMoveView.as_view()),
    path('questions/bulk-delete/', views.AdminBulkDeleteView.as_view()),
]
