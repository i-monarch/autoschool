import json
from pathlib import Path

from django.core.management.base import BaseCommand

from apps.routes.models import ExamCenter, RouteImage


class Command(BaseCommand):
    help = 'Load HSC route images from fixture into RouteImage records'

    def handle(self, *args, **options):
        fixture_path = Path(__file__).resolve().parent.parent.parent / 'fixtures' / 'hsc_images.json'
        with open(fixture_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        total_created = 0
        total_skipped = 0
        not_found = []

        for center_url, image_urls in data.items():
            try:
                center = ExamCenter.objects.get(source_url=center_url)
            except ExamCenter.DoesNotExist:
                not_found.append(center_url)
                continue

            if center.images.exists():
                self.stdout.write(f'Skipped {center} - already has {center.images.count()} images')
                total_skipped += 1
                continue

            for order, img_url in enumerate(image_urls, start=1):
                RouteImage.objects.create(
                    center=center,
                    source_url=img_url,
                    order=order,
                )
            total_created += len(image_urls)
            self.stdout.write(f'Created {len(image_urls)} images for {center}')

        self.stdout.write(self.style.SUCCESS(
            f'Done: {total_created} images created, {total_skipped} centers skipped'
        ))
        if not_found:
            self.stdout.write(self.style.WARNING(
                f'{len(not_found)} centers not found in DB:'
            ))
            for url in not_found:
                self.stdout.write(f'  {url}')
