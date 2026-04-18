from rest_framework import generics

from .models import StudyReminder
from .serializers import StudyReminderSerializer


class StudyReminderView(generics.RetrieveUpdateAPIView):
    serializer_class = StudyReminderSerializer

    def get_object(self):
        obj, _ = StudyReminder.objects.get_or_create(user=self.request.user)
        return obj
