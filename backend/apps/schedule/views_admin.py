from datetime import timedelta

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Q
from django.utils import timezone

from apps.core.permissions import IsAdmin
from apps.users.models import User
from .models import TimeSlot, Booking
from .serializers_admin import (
    AdminSlotListSerializer,
    AdminSlotDetailSerializer,
    AdminSlotCreateSerializer,
)


class AdminSlotListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdmin]
    pagination_class = None

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return AdminSlotCreateSerializer
        return AdminSlotListSerializer

    def get_queryset(self):
        qs = TimeSlot.objects.select_related('teacher').annotate(
            active_bookings_count=Count('bookings', filter=Q(bookings__status='booked')),
        )

        date_from = self.request.query_params.get('date_from')
        if date_from:
            qs = qs.filter(date__gte=date_from)

        date_to = self.request.query_params.get('date_to')
        if date_to:
            qs = qs.filter(date__lte=date_to)

        lesson_type = self.request.query_params.get('type')
        if lesson_type:
            qs = qs.filter(lesson_type=lesson_type)

        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        return qs

    def perform_create(self, serializer):
        repeat_weeks = serializer.validated_data.pop('repeat_weeks', 0)
        teacher = serializer.validated_data.get('teacher')
        if not serializer.validated_data.get('meet_url') and teacher and teacher.default_meet_url:
            serializer.validated_data['meet_url'] = teacher.default_meet_url
        slot = serializer.save()

        if repeat_weeks > 0:
            for week in range(1, repeat_weeks + 1):
                TimeSlot.objects.create(
                    teacher=slot.teacher,
                    date=slot.date + timedelta(weeks=week),
                    start_time=slot.start_time,
                    end_time=slot.end_time,
                    lesson_type=slot.lesson_type,
                    title=slot.title,
                    description=slot.description,
                    meet_url=slot.meet_url,
                    max_students=slot.max_students,
                )


class AdminSlotDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdmin]
    queryset = TimeSlot.objects.select_related('teacher').prefetch_related(
        'bookings', 'bookings__student',
    )

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return AdminSlotCreateSerializer
        return AdminSlotDetailSerializer

    def perform_destroy(self, instance):
        if instance.bookings.filter(status='booked').exists():
            instance.status = 'cancelled'
            instance.save(update_fields=['status'])
            Booking.objects.filter(slot=instance, status='booked').update(
                status='cancelled', cancelled_at=timezone.now(),
            )
        else:
            instance.delete()


class AdminCancelSlotView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        try:
            slot = TimeSlot.objects.get(id=pk)
        except TimeSlot.DoesNotExist:
            return Response({'detail': 'Слот не знайдено.'}, status=status.HTTP_404_NOT_FOUND)

        slot.status = 'cancelled'
        slot.save(update_fields=['status'])
        Booking.objects.filter(slot=slot, status='booked').update(
            status='cancelled', cancelled_at=timezone.now(),
        )
        return Response({'status': 'cancelled'})


class AdminTeachersListView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        teachers = User.objects.filter(role='teacher').values('id', 'first_name', 'last_name', 'username', 'default_meet_url')
        result = [
            {
                'id': t['id'],
                'name': f"{t['first_name']} {t['last_name']}".strip() or t['username'],
                'default_meet_url': t['default_meet_url'] or '',
            }
            for t in teachers
        ]
        return Response(result)


class AdminScheduleStatsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        today = timezone.now().date()
        slots = TimeSlot.objects.all()
        upcoming = slots.filter(date__gte=today).exclude(status='cancelled')
        active_bookings = Booking.objects.filter(status='booked', slot__date__gte=today)

        return Response({
            'total_slots': upcoming.count(),
            'total_bookings': active_bookings.count(),
            'this_week': upcoming.filter(
                date__lte=today + timezone.timedelta(days=7),
            ).count(),
            'cancelled': slots.filter(status='cancelled').count(),
        })
