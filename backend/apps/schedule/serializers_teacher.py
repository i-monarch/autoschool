from rest_framework import serializers
from .models import TimeSlot, Booking


class SlotBookingSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_phone = serializers.CharField(source='student.phone', read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'student_name', 'student_phone', 'status', 'created_at']

    def get_student_name(self, obj):
        return obj.student.get_full_name() or obj.student.username


class TeacherSlotListSerializer(serializers.ModelSerializer):
    bookings_count = serializers.IntegerField(source='active_bookings_count', read_only=True)

    class Meta:
        model = TimeSlot
        fields = [
            'id', 'date', 'start_time', 'end_time',
            'lesson_type', 'title', 'description',
            'meet_url', 'max_students', 'status',
            'bookings_count',
        ]


class TeacherSlotDetailSerializer(serializers.ModelSerializer):
    bookings = SlotBookingSerializer(many=True, read_only=True)

    class Meta:
        model = TimeSlot
        fields = [
            'id', 'date', 'start_time', 'end_time',
            'lesson_type', 'title', 'description',
            'meet_url', 'max_students', 'status',
            'bookings',
        ]


class TeacherSlotCreateSerializer(serializers.ModelSerializer):
    repeat_weeks = serializers.IntegerField(required=False, default=0, min_value=0, max_value=12)

    class Meta:
        model = TimeSlot
        fields = [
            'date', 'start_time', 'end_time',
            'lesson_type', 'title', 'description',
            'meet_url', 'max_students', 'repeat_weeks',
        ]

    def validate(self, data):
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError(
                {'end_time': 'Час закінчення має бути пізніше часу початку.'}
            )

        teacher = self.context['request'].user
        overlapping = TimeSlot.objects.filter(
            teacher=teacher,
            date=data['date'],
            start_time__lt=data['end_time'],
            end_time__gt=data['start_time'],
        ).exclude(status='cancelled')

        if self.instance:
            overlapping = overlapping.exclude(pk=self.instance.pk)

        if overlapping.exists():
            raise serializers.ValidationError(
                'Цей час перетинається з іншим слотом.'
            )
        return data
