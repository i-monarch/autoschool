from datetime import timedelta

from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Subscription, Tariff
from .serializers import (
    SubscribeRequestSerializer,
    SubscriptionSerializer,
    TariffListSerializer,
)


class TariffListView(generics.ListAPIView):
    permission_classes = [AllowAny]
    serializer_class = TariffListSerializer
    pagination_class = None

    def get_queryset(self):
        qs = Tariff.objects.filter(is_active=True)
        user_type = self.request.query_params.get('user_type')
        if user_type in ('student', 'instructor'):
            qs = qs.filter(user_type=user_type)
        return qs


class MySubscriptionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        subscription = request.user.subscriptions.filter(
            is_active=True,
            payment_status=Subscription.PaymentStatus.PAID,
            expires_at__gt=timezone.now(),
        ).select_related('tariff').first()
        data = SubscriptionSerializer(subscription).data if subscription else None
        return Response(data)


class SubscribeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        ser = SubscribeRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        tariff = get_object_or_404(
            Tariff,
            pk=ser.validated_data['tariff_id'],
            is_active=True,
        )
        subscription = Subscription.objects.create(
            user=request.user,
            tariff=tariff,
            payment_status=Subscription.PaymentStatus.PENDING,
            expires_at=timezone.now() + timedelta(days=tariff.duration_days),
        )

        return Response({
            'subscription': SubscriptionSerializer(subscription).data,
            'payment_url': None,
        }, status=status.HTTP_201_CREATED)
