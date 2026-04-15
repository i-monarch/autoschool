from rest_framework import serializers
from django.utils import timezone

from .models import TimeSlot, Booking


class SlotTeacherSerializer(serializers.ModelSerializer):
    class Meta:
        from apps.users.models import User
        model = User
        fields = ['id', 'first_name', 'last_name', 'avatar']


class AvailableSlotSerializer(serializers.ModelSerializer):
    teacher_name = serializers.SerializerMethodField()
    teacher_avatar = serializers.ImageField(source='teacher.avatar', read_only=True)
    spots_left = serializers.SerializerMethodField()

    class Meta:
        model = TimeSlot
        fields = [
            'id', 'date', 'start_time', 'end_time',
            'lesson_type', 'title', 'description',
            'teacher_name', 'teacher_avatar',
            'max_students', 'spots_left',
        ]

    def get_teacher_name(self, obj):
        return obj.teacher.get_full_name() or obj.teacher.username

    def get_spots_left(self, obj):
        return obj.max_students - obj.bookings_count


class BookingListSerializer(serializers.ModelSerializer):
    slot_id = serializers.IntegerField(source='slot.id')
    date = serializers.DateField(source='slot.date')
    start_time = serializers.TimeField(source='slot.start_time')
    end_time = serializers.TimeField(source='slot.end_time')
    lesson_type = serializers.CharField(source='slot.lesson_type')
    title = serializers.CharField(source='slot.title')
    meet_url = serializers.URLField(source='slot.meet_url')
    teacher_name = serializers.SerializerMethodField()

    class Meta:
        model = Booking
        fields = [
            'id', 'slot_id', 'status', 'created_at',
            'date', 'start_time', 'end_time',
            'lesson_type', 'title', 'meet_url',
            'teacher_name',
        ]

    def get_teacher_name(self, obj):
        return obj.slot.teacher.get_full_name() or obj.slot.teacher.username


class CreateBookingSerializer(serializers.Serializer):
    slot_id = serializers.IntegerField()

    def validate_slot_id(self, value):
        try:
            slot = TimeSlot.objects.get(id=value)
        except TimeSlot.DoesNotExist:
            raise serializers.ValidationError('Слот не знайдено.')

        if slot.status == 'cancelled':
            raise serializers.ValidationError('Цей слот скасовано.')
        if slot.is_full:
            raise serializers.ValidationError('Немає вільних місць.')
        if slot.date < timezone.now().date():
            raise serializers.ValidationError('Цей слот вже минув.')

        student = self.context['request'].user
        if Booking.objects.filter(slot=slot, student=student, status='booked').exists():
            raise serializers.ValidationError('Ви вже записані на цей слот.')

        self.slot = slot
        return value
