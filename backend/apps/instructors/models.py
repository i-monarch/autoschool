from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class Instructor(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='instructor_profile',
        verbose_name=_('user'),
    )
    photo = models.ImageField(_('photo'), upload_to='instructors/photos/', blank=True)
    car_photo = models.ImageField(_('car photo'), upload_to='instructors/cars/', blank=True)
    car_model = models.CharField(_('car model'), max_length=100, blank=True)
    description = models.TextField(_('description'), blank=True)
    price_per_hour = models.PositiveIntegerField(_('price per hour'), null=True, blank=True)
    certificate_photo = models.ImageField(
        _('certificate photo'),
        upload_to='instructors/certificates/',
        blank=True,
    )
    vin_code = models.CharField(_('VIN code'), max_length=17, blank=True)
    tech_passport = models.ImageField(
        _('technical passport'),
        upload_to='instructors/tech_passports/',
        blank=True,
    )
    is_official = models.BooleanField(_('official'), default=False)
    is_car_equipped = models.BooleanField(_('car equipped'), default=False)
    is_verified = models.BooleanField(_('verified'), default=False)
    verification_note = models.TextField(_('verification note'), blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'instructors'
        ordering = ['-created_at']

    def __str__(self):
        return str(self.user)
