from django.contrib import admin
from .models import ExamCenter, ExamRoute


class ExamRouteInline(admin.TabularInline):
    model = ExamRoute
    extra = 1


@admin.register(ExamCenter)
class ExamCenterAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'address', 'order']
    list_filter = ['city']
    inlines = [ExamRouteInline]


@admin.register(ExamRoute)
class ExamRouteAdmin(admin.ModelAdmin):
    list_display = ['name', 'center', 'order']
    list_filter = ['center']
