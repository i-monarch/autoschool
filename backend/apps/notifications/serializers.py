from rest_framework import serializers

from .models import StudyReminder


class StudyReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyReminder
        fields = (
            'enabled', 'message',
            'monday', 'tuesday', 'wednesday', 'thursday',
            'friday', 'saturday', 'sunday',
            'updated_at',
        )
        read_only_fields = ('updated_at',)
