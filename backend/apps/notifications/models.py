from django.conf import settings
from django.db import models


class StudyReminder(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='study_reminder',
    )
    enabled = models.BooleanField(default=True)
    monday = models.TimeField(null=True, blank=True)
    tuesday = models.TimeField(null=True, blank=True)
    wednesday = models.TimeField(null=True, blank=True)
    thursday = models.TimeField(null=True, blank=True)
    friday = models.TimeField(null=True, blank=True)
    saturday = models.TimeField(null=True, blank=True)
    sunday = models.TimeField(null=True, blank=True)
    message = models.CharField(max_length=255, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'study_reminders'

    def __str__(self):
        return f'{self.user} reminder'
