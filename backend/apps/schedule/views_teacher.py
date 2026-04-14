from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count, Q
from django.utils import timezone

from apps.core.permissions import IsTeacher
from .models import TimeSlot, Booking
from .serializers_teacher import (
    TeacherSlotListSerializer,
    TeacherSlotDetailSerializer,
    TeacherSlotCreateSerializer,
)


class TeacherSlotListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsTeacher]
    pagination_class = None

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TeacherSlotCreateSerializer
        return TeacherSlotListSerializer

    def get_queryset(self):
        qs = TimeSlot.objects.filter(
            teacher=self.request.user,
        ).annotate(
            active_bookings_count=Count('bookings', filter=Q(bookings__status='booked')),
        )

        date_from = self.request.query_params.get('date_from')
        if date_from:
            qs = qs.filter(date__gte=date_from)

        date_to = self.request.query_params.get('date_to')
        if date_to:
            qs = qs.filter(date__lte=date_to)

        return qs

    def perform_create(self, serializer):
        serializer.save(teacher=self.request.user)


class TeacherSlotDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsTeacher]

    def get_serializer_class(self):
        if self.request.method in ('PUT', 'PATCH'):
            return TeacherSlotCreateSerializer
        return TeacherSlotDetailSerializer

    def get_queryset(self):
        return TimeSlot.objects.filter(
            teacher=self.request.user,
        ).prefetch_related('bookings', 'bookings__student')

    def perform_destroy(self, instance):
        if instance.bookings.filter(status='booked').exists():
            instance.status = 'cancelled'
            instance.save(update_fields=['status'])
        else:
            instance.delete()


class TeacherCancelSlotView(APIView):
    permission_classes = [IsTeacher]

    def post(self, request, pk):
        try:
            slot = TimeSlot.objects.get(id=pk, teacher=request.user)
        except TimeSlot.DoesNotExist:
            return Response(
                {'detail': 'Слот не знайдено.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        slot.status = 'cancelled'
        slot.save(update_fields=['status'])
        Booking.objects.filter(slot=slot, status='booked').update(
            status='cancelled', cancelled_at=timezone.now(),
        )
        return Response({'status': 'cancelled'})


class TeacherScheduleStatsView(APIView):
    permission_classes = [IsTeacher]

    def get(self, request):
        today = timezone.now().date()
        slots = TimeSlot.objects.filter(teacher=request.user)
        upcoming = slots.filter(date__gte=today).exclude(status='cancelled')
        bookings = Booking.objects.filter(
            slot__teacher=request.user, status='booked',
            slot__date__gte=today,
        )
        return Response({
            'total_slots': upcoming.count(),
            'total_bookings': bookings.count(),
            'this_week': upcoming.filter(
                date__lte=today + timezone.timedelta(days=7),
            ).count(),
        })
