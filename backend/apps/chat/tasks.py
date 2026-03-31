import logging
from io import BytesIO

from celery import shared_task
from django.core.files.base import ContentFile
from PIL import Image

from .models import MessageAttachment

logger = logging.getLogger(__name__)

THUMBNAIL_SIZE = (300, 300)


@shared_task
def generate_thumbnail(attachment_id):
    try:
        attachment = MessageAttachment.objects.get(pk=attachment_id)
    except MessageAttachment.DoesNotExist:
        return

    if not attachment.content_type.startswith('image/'):
        return

    try:
        img = Image.open(attachment.file)
        img.thumbnail(THUMBNAIL_SIZE, Image.LANCZOS)

        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')

        buf = BytesIO()
        img.save(buf, format='JPEG', quality=85)
        buf.seek(0)

        thumb_name = f'thumb_{attachment.filename.rsplit(".", 1)[0]}.jpg'
        attachment.thumbnail.save(thumb_name, ContentFile(buf.read()), save=True)
    except Exception:
        logger.exception('Failed to generate thumbnail for attachment %s', attachment_id)
