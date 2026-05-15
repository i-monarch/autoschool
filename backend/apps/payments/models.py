from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class Tariff(models.Model):
    class UserType(models.TextChoices):
        STUDENT = 'student', _('student')
        INSTRUCTOR = 'instructor', _('instructor')

    name = models.CharField(_('name'), max_length=100)
    description = models.TextField(_('description'), blank=True, default='')
    price = models.DecimalField(_('price'), max_digits=10, decimal_places=2)
    duration_days = models.PositiveIntegerField(_('duration (days)'))
    user_type = models.CharField(
        _('user type'),
        max_length=20,
        choices=UserType.choices,
        default=UserType.STUDENT,
        db_index=True,
    )
    features = models.JSONField(_('features'), default=list, blank=True)
    is_popular = models.BooleanField(_('popular'), default=False)
    is_active = models.BooleanField(_('active'), default=True)
    order = models.PositiveIntegerField(_('order'), default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order', 'price']
        verbose_name = _('tariff')
        verbose_name_plural = _('tariffs')

    def __str__(self):
        return self.name


class Subscription(models.Model):
    class PaymentStatus(models.TextChoices):
        PENDING = 'pending', _('pending')
        PAID = 'paid', _('paid')
        FAILED = 'failed', _('failed')

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='subscriptions',
        verbose_name=_('user'),
    )
    tariff = models.ForeignKey(
        Tariff,
        on_delete=models.CASCADE,
        related_name='subscriptions',
        verbose_name=_('tariff'),
    )
    started_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(_('expires at'))
    is_active = models.BooleanField(_('active'), default=True, db_index=True)
    payment_status = models.CharField(
        _('payment status'),
        max_length=10,
        choices=PaymentStatus.choices,
        default=PaymentStatus.PENDING,
        db_index=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'subscriptions'
        ordering = ['-created_at']
        verbose_name = _('subscription')
        verbose_name_plural = _('subscriptions')

    def __str__(self):
        return f'{self.user} — {self.tariff} {self.payment_status}'
