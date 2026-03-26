import json
import os
import shutil
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand

from apps.routes.models import ExamCenter, RouteImage


class Command(BaseCommand):
    help = 'Import downloaded HSC images from hsc_images/ directory into media'

    def add_arguments(self, parser):
        parser.add_argument('--source', default='/tmp/hsc_images',
                            help='Path to extracted hsc_images directory')

    def handle(self, *args, **options):
        source_dir = Path(options['source'])
        if not source_dir.exists():
            self.stderr.write(f'Source directory not found: {source_dir}')
            return

        fixture_path = Path(__file__).resolve().parent.parent.parent / 'fixtures' / 'hsc_images.json'
        with open(fixture_path, 'r', encoding='utf-8') as f:
            fixture = json.load(f)

        media_dir = Path(settings.MEDIA_ROOT) / 'routes' / 'images'
        media_dir.mkdir(parents=True, exist_ok=True)

        total_imported = 0
        total_skipped = 0

        for center_url, image_urls in fixture.items():
            slug = center_url.replace('https://hsc.gov.ua/', '').replace('/', '')[:80]
            center_dir = source_dir / slug

            if not center_dir.exists():
                self.stdout.write(f'  Dir not found: {slug}')
                continue

            try:
                center = ExamCenter.objects.get(source_url=center_url)
            except ExamCenter.DoesNotExist:
                continue

            files = sorted([f for f in center_dir.iterdir() if f.suffix.lower() in ('.jpg', '.jpeg', '.png')])
            if not files:
                continue

            images = list(center.images.order_by('order'))
            if len(images) == 0:
                self.stdout.write(f'  No RouteImage records for {center.name}')
                continue

            for i, img_file in enumerate(files):
                if i >= len(images):
                    break

                route_image = images[i]
                if route_image.image:
                    total_skipped += 1
                    continue

                # Copy file to media
                dest_name = f'{center.id}_{i+1}{img_file.suffix}'
                dest_path = media_dir / dest_name
                shutil.copy2(img_file, dest_path)

                # Update DB record
                route_image.image = f'routes/images/{dest_name}'
                route_image.save(update_fields=['image'])
                total_imported += 1

            self.stdout.write(f'  {center.name}: {min(len(files), len(images))} images')

        self.stdout.write(self.style.SUCCESS(
            f'\nDone! Imported: {total_imported}, Skipped: {total_skipped}'
        ))
