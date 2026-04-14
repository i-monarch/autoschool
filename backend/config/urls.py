from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.users.urls.auth')),
    path('api/v1/users/', include('apps.users.urls.users')),
    path('api/v1/tests/', include('apps.testing.urls')),
    path('api/v1/admin/tests/', include('apps.testing.urls_admin')),
    path('api/v1/theory/', include('apps.theory.urls')),
    path('api/v1/admin/theory/', include('apps.theory.urls_admin')),
    path('api/v1/admin/courses/', include('apps.courses.urls_admin')),
    path('api/v1/admin/students/', include('apps.users.urls_admin')),
    path('api/v1/payments/', include('apps.payments.urls')),
    path('api/v1/admin/payments/', include('apps.payments.urls_admin')),
    path('api/v1/courses/', include('apps.courses.urls')),
    path('api/v1/routes/', include('apps.routes.urls')),
    path('api/v1/chat/', include('apps.chat.urls')),
    path('api/v1/admin/routes/', include('apps.routes.urls_admin')),
    path('api/v1/motivation/', include('apps.gamification.urls')),
    path('api/v1/schedule/', include('apps.schedule.urls')),
    path('api/v1/teacher/schedule/', include('apps.schedule.urls_teacher')),
    path('api/v1/teacher/', include('apps.users.urls_teacher')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += [path('__debug__/', include('debug_toolbar.urls'))]
