from django.contrib import admin
from .models import Region, ExamCenter, ExamRoute, RouteImage


class ExamRouteInline(admin.TabularInline):
    model = ExamRoute
    extra = 0


class RouteImageInline(admin.TabularInline):
    model = RouteImage
    extra = 0
    readonly_fields = ['source_url']


@admin.register(Region)
class RegionAdmin(admin.ModelAdmin):
    list_display = ['name', 'order', 'centers_count']

    def centers_count(self, obj):
        return obj.centers.count()
    centers_count.short_description = 'Centers'


@admin.register(ExamCenter)
class ExamCenterAdmin(admin.ModelAdmin):
    list_display = ['name', 'city', 'region', 'order']
    list_filter = ['region', 'city']
    search_fields = ['name', 'city', 'address']
    inlines = [ExamRouteInline, RouteImageInline]


@admin.register(ExamRoute)
class ExamRouteAdmin(admin.ModelAdmin):
    list_display = ['name', 'center', 'order']
    list_filter = ['center']


@admin.register(RouteImage)
class RouteImageAdmin(admin.ModelAdmin):
    list_display = ['center', 'order', 'source_url']
    list_filter = ['center']
