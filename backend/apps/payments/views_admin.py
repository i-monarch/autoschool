from rest_framework import generics, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import IsAdmin
from .models import Subscription, Tariff
from .serializers_admin import (
    AdminSubscriptionSerializer,
    AdminTariffSerializer,
    AdminTariffReorderSerializer,
)


class StandardPagination(PageNumberPagination):
    page_size = 20


class AdminTariffListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminTariffSerializer
    queryset = Tariff.objects.all()
    pagination_class = None


class AdminTariffDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminTariffSerializer
    queryset = Tariff.objects.all()


class AdminTariffReorderView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        ser = AdminTariffReorderSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        for i, tariff_id in enumerate(ser.validated_data['ordered_ids']):
            Tariff.objects.filter(id=tariff_id).update(order=i)

        return Response({'status': 'ok'})


class AdminTariffStatsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        tariffs = Tariff.objects.all()
        return Response({
            'total': tariffs.count(),
            'active': tariffs.filter(is_active=True).count(),
        })


class AdminSubscriptionListView(generics.ListAPIView):
    permission_classes = [IsAdmin]
    serializer_class = AdminSubscriptionSerializer
    pagination_class = StandardPagination

    def get_queryset(self):
        qs = Subscription.objects.select_related('user', 'tariff')
        payment_status = self.request.query_params.get('payment_status')
        if payment_status in Subscription.PaymentStatus.values:
            qs = qs.filter(payment_status=payment_status)
        return qs


class AdminSubscriptionMarkPaidView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        subscription = Subscription.objects.filter(pk=pk).select_related('user', 'tariff').first()
        if not subscription:
            return Response({'error': 'not_found'}, status=status.HTTP_404_NOT_FOUND)

        subscription.payment_status = Subscription.PaymentStatus.PAID
        subscription.is_active = True
        subscription.save(update_fields=['payment_status', 'is_active', 'updated_at'])
        return Response(AdminSubscriptionSerializer(subscription).data)


class AdminSubscriptionCancelView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request, pk):
        subscription = Subscription.objects.filter(pk=pk).select_related('user', 'tariff').first()
        if not subscription:
            return Response({'error': 'not_found'}, status=status.HTTP_404_NOT_FOUND)

        subscription.is_active = False
        subscription.save(update_fields=['is_active', 'updated_at'])
        return Response(AdminSubscriptionSerializer(subscription).data)
