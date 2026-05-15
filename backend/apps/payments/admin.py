from django.contrib import admin

from .models import Subscription, Tariff


@admin.register(Tariff)
class TariffAdmin(admin.ModelAdmin):
    list_display = ('name', 'user_type', 'price', 'duration_days', 'is_active', 'order')
    list_filter = ('user_type', 'is_active', 'is_popular')
    search_fields = ('name',)


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ('user', 'tariff', 'payment_status', 'is_active', 'expires_at')
    list_filter = ('payment_status', 'is_active', 'tariff__user_type')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('started_at', 'created_at', 'updated_at')
