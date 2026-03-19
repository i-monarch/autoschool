import logging

from django.conf import settings
from django.utils import timezone

from .models import UserDevice

logger = logging.getLogger(__name__)


def register_device(user, device_id, device_name, ip_address):
    active_devices = UserDevice.objects.filter(user=user, is_active=True)
    max_devices = getattr(settings, 'MAX_DEVICES_PER_USER', 2)

    if active_devices.count() >= max_devices:
        oldest = active_devices.order_by('last_active').first()
        oldest.is_active = False
        oldest.save(update_fields=['is_active'])
        logger.warning(
            'Device limit reached for user %s, deactivated device %s',
            user.id, oldest.device_id,
        )

    device, created = UserDevice.objects.update_or_create(
        user=user,
        device_id=device_id,
        defaults={
            'device_name': device_name,
            'ip_address': ip_address,
            'is_active': True,
            'last_active': timezone.now(),
        },
    )

    if created:
        logger.info('New device registered for user %s: %s', user.id, device_name)

    return device
