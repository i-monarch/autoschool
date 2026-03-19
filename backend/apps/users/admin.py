from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin

from .models import User, UserDevice, UserSession


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'phone', 'role', 'is_phone_verified', 'created_at')
    list_filter = ('role', 'is_phone_verified', 'is_active')
    search_fields = ('username', 'email', 'phone', 'first_name', 'last_name')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Extra', {'fields': ('phone', 'role', 'avatar', 'language', 'is_phone_verified')}),
    )


@admin.register(UserDevice)
class UserDeviceAdmin(admin.ModelAdmin):
    list_display = ('user', 'device_name', 'ip_address', 'city', 'is_active', 'last_active')
    list_filter = ('is_active',)
    search_fields = ('user__username', 'device_name', 'ip_address')


@admin.register(UserSession)
class UserSessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'ip_address', 'created_at', 'expires_at')
    search_fields = ('user__username',)
