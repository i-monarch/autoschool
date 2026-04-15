from rest_framework import serializers
from .models import TimeSlot, Booking


class AdminBookingSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_phone = serializers.CharField(source='student.phone', read_only=True)

    class Meta:
        model = Booking
        fields = ['id', 'student_name', 'student_phone', 'status', 'created_at', 'cancelled_at']

    def get_student_name(self, obj):
        return obj.student.get_full_name() or obj.student.username


class AdminSlotListSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()
    bookings_count = serializers.IntegerField(source='active_bookings_count', read_only=True)

    class Meta:
        model = TimeSlot
        fields = [
            'id', 'date', 'start_time', 'end_time',
            'lesson_type', 'title', 'description',
            'meet_url', 'max_students', 'status',
            'teacher_name', 'bookings_count',
        ]

    def get_teacher_name(self, obj):
        return obj.teacher.get_full_name() or obj.teacher.username


class AdminSlotDetailSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()
    teacher_id = serializers.IntegerField(source='teacher.id', read_only=True)
    bookings = AdminBookingSerializer(many=True, read_only=True)

    class Meta:
        model = TimeSlot
        fields = [
            'id', 'date', 'start_time', 'end_time',
            'lesson_type', 'title', 'description',
            'meet_url', 'max_students', 'status',
            'teacher_id', 'teacher_name', 'bookings',
        ]

    def get_teacher_name(self, obj):
        return obj.teacher.get_full_name() or obj.teacher.username


class AdminSlotCreateSerializer(serializers.ModelSerializer):
    repeat_weeks = serializers.IntegerField(required=False, default=0, min_value=0, max_value=12)

    class Meta:
        model = TimeSlot
        fields = [
            'teacher', 'date', 'start_time', 'end_time',
            'lesson_type', 'title', 'description',
            'meet_url', 'max_students', 'repeat_weeks',
        ]

    def validate(self, data):
        if data['start_time'] >= data['end_time']:
            raise serializers.ValidationError(
                {'end_time': 'Час закінчення має бути пізніше часу початку.'}
            )

        overlapping = TimeSlot.objects.filter(
            teacher=data['teacher'],
            date=data['date'],
            start_time__lt=data['end_time'],
            end_time__gt=data['start_time'],
        ).exclude(status='cancelled')

        if self.instance:
            overlapping = overlapping.exclude(pk=self.instance.pk)

        if overlapping.exists():
            raise serializers.ValidationError('Цей час перетинається з іншим слотом.')
        return data
