from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone

from apps.core.permissions import IsStudent
from .models import TimeSlot, Booking
from .serializers import (
    AvailableSlotSerializer,
    BookingListSerializer,
    CreateBookingSerializer,
)


class AvailableSlotsView(generics.ListAPIView):
    serializer_class = AvailableSlotSerializer
    pagination_class = None

    def get_queryset(self):
        qs = TimeSlot.objects.filter(
            status='available',
            date__gte=timezone.now().date(),
        ).select_related('teacher')

        lesson_type = self.request.query_params.get('type')
        if lesson_type:
            qs = qs.filter(lesson_type=lesson_type)

        date_from = self.request.query_params.get('date_from')
        if date_from:
            qs = qs.filter(date__gte=date_from)

        date_to = self.request.query_params.get('date_to')
        if date_to:
            qs = qs.filter(date__lte=date_to)

        return qs


class MyBookingsView(generics.ListAPIView):
    serializer_class = BookingListSerializer
    permission_classes = [IsStudent]
    pagination_class = None

    def get_queryset(self):
        qs = Booking.objects.filter(
            student=self.request.user,
        ).select_related('slot', 'slot__teacher')

        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)
        return qs


class CreateBookingView(APIView):
    permission_classes = [IsStudent]

    def post(self, request):
        ser = CreateBookingSerializer(data=request.data, context={'request': request})
        ser.is_valid(raise_exception=True)

        slot = ser.slot
        booking = Booking.objects.create(
            slot=slot,
            student=request.user,
        )
        slot.update_status()

        return Response(
            BookingListSerializer(booking).data,
            status=status.HTTP_201_CREATED,
        )


class CancelBookingView(APIView):
    permission_classes = [IsStudent]

    def post(self, request, pk):
        try:
            booking = Booking.objects.select_related('slot').get(
                id=pk, student=request.user, status='booked',
            )
        except Booking.DoesNotExist:
            return Response(
                {'detail': 'Бронювання не знайдено.'},
                status=status.HTTP_404_NOT_FOUND,
            )

        booking.status = 'cancelled'
        booking.cancelled_at = timezone.now()
        booking.save(update_fields=['status', 'cancelled_at'])
        booking.slot.update_status()

        return Response({'status': 'cancelled'})
