from django.conf import settings
from django.db import models
from django.utils.translation import gettext_lazy as _


class TimeSlot(models.Model):
    LESSON_TYPE_CHOICES = [
        ('online', _('Online consultation')),
        ('theory', _('Theory lesson')),
        ('practice', _('Practice lesson')),
    ]
    STATUS_CHOICES = [
        ('available', _('Available')),
        ('full', _('Full')),
        ('cancelled', _('Cancelled')),
    ]

    teacher = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='schedule_slots',
        limit_choices_to={'role': 'teacher'},
    )
    date = models.DateField(_('date'))
    start_time = models.TimeField(_('start time'))
    end_time = models.TimeField(_('end time'))
    lesson_type = models.CharField(
        _('lesson type'), max_length=20,
        choices=LESSON_TYPE_CHOICES, default='online',
    )
    title = models.CharField(_('title'), max_length=200, blank=True)
    description = models.TextField(_('description'), blank=True)
    meet_url = models.URLField(_('meeting link'), blank=True)
    max_students = models.PositiveIntegerField(_('max students'), default=0, help_text='0 = unlimited')
    status = models.CharField(
        _('status'), max_length=20,
        choices=STATUS_CHOICES, default='available',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'schedule_slots'
        ordering = ['date', 'start_time']

    def __str__(self):
        return f'{self.teacher} | {self.date} {self.start_time}-{self.end_time}'

    @property
    def bookings_count(self):
        return self.bookings.filter(status='booked').count()

    @property
    def is_full(self):
        if self.max_students == 0:
            return False
        return self.bookings_count >= self.max_students

    def update_status(self):
        if self.status == 'cancelled':
            return
        new_status = 'full' if self.is_full else 'available'
        if self.status != new_status:
            self.status = new_status
            self.save(update_fields=['status'])


class Booking(models.Model):
    STATUS_CHOICES = [
        ('booked', _('Booked')),
        ('cancelled', _('Cancelled')),
        ('completed', _('Completed')),
    ]

    slot = models.ForeignKey(
        TimeSlot, on_delete=models.CASCADE, related_name='bookings',
    )
    student = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='schedule_bookings',
        limit_choices_to={'role': 'student'},
    )
    status = models.CharField(
        _('status'), max_length=20,
        choices=STATUS_CHOICES, default='booked',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'schedule_bookings'
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['slot', 'student'],
                condition=models.Q(status='booked'),
                name='unique_active_booking',
            ),
        ]

    def __str__(self):
        return f'{self.student} -> {self.slot}'
