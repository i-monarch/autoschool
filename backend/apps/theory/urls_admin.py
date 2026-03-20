from django.urls import path
from . import views_admin as views

urlpatterns = [
    # Stats
    path('stats/', views.AdminTheoryStatsView.as_view()),

    # Sections
    path('sections/', views.AdminSectionListCreateView.as_view()),
    path('sections/<int:pk>/', views.AdminSectionDetailView.as_view()),
    path('sections/reorder/', views.AdminSectionReorderView.as_view()),

    # Chapters
    path('chapters/', views.AdminChapterListView.as_view()),
    path('chapters/create/', views.AdminChapterCreateView.as_view()),
    path('chapters/<int:pk>/', views.AdminChapterDetailView.as_view()),
    path('chapters/reorder/', views.AdminChapterReorderView.as_view()),
]
