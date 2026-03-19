from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    ROLE_CHOICES = [
        ('student', _('Student')),
        ('teacher', _('Teacher')),
        ('admin', _('Admin')),
    ]

    phone = models.CharField(_('phone'), max_length=20, unique=True, blank=True, null=True)
    role = models.CharField(_('role'), max_length=10, choices=ROLE_CHOICES, default='student')
    avatar = models.ImageField(_('avatar'), upload_to='avatars/', blank=True)
    language = models.CharField(_('language'), max_length=5, default='uk')
    is_phone_verified = models.BooleanField(_('phone verified'), default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'users'
        ordering = ['-created_at']

    def __str__(self):
        return self.get_full_name() or self.username


class UserDevice(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='devices')
    device_id = models.CharField(max_length=255)
    device_name = models.CharField(max_length=255, blank=True)
    ip_address = models.GenericIPAddressField()
    city = models.CharField(max_length=100, blank=True)
    last_active = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = 'user_devices'
        unique_together = ['user', 'device_id']

    def __str__(self):
        return f'{self.user} - {self.device_name or self.device_id}'


class UserSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions')
    device = models.ForeignKey(UserDevice, on_delete=models.CASCADE, related_name='sessions')
    session_key = models.CharField(max_length=255, unique=True)
    ip_address = models.GenericIPAddressField()
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        db_table = 'user_sessions'

    def __str__(self):
        return f'{self.user} - {self.session_key[:8]}'
