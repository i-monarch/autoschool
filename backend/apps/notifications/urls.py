from django.urls import path

from .views import StudyReminderView

urlpatterns = [
    path('study-reminder/', StudyReminderView.as_view(), name='study-reminder'),
]
