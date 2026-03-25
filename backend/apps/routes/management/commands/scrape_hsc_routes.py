import json
import os
import time
import requests
from pathlib import Path

from bs4 import BeautifulSoup
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from apps.routes.models import Region, ExamCenter, RouteImage


HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
                  '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    'Accept-Language': 'uk-UA,uk;q=0.9,en-US;q=0.8,en;q=0.7',
}

FIXTURE_PATH = Path(__file__).resolve().parent.parent.parent / 'fixtures' / 'hsc_routes.json'


class Command(BaseCommand):
    help = 'Load exam routes from HSC fixture and download images'

    def add_arguments(self, parser):
        parser.add_argument('--skip-images', action='store_true', help='Only load centers, skip image download')
        parser.add_argument('--images-only', action='store_true', help='Only download images for existing centers')

    def handle(self, *args, **options):
        skip_images = options['skip_images']
        images_only = options['images_only']

        if not images_only:
            self._load_fixture()

        if not skip_images:
            self._download_all_images()

        self.stdout.write(self.style.SUCCESS('\nDone!'))

    def _load_fixture(self):
        self.stdout.write(f'Loading fixture from {FIXTURE_PATH}')

        with open(FIXTURE_PATH, 'r', encoding='utf-8') as f:
            data = json.load(f)

        for idx, region_data in enumerate(data):
            region_name = region_data['region']
            region, created = Region.objects.update_or_create(
                name=region_name,
                defaults={'order': idx},
            )
            action = 'Created' if created else 'Updated'
            self.stdout.write(f'  {action} region: {region_name}')

            for c_idx, center_data in enumerate(region_data['centers']):
                center_name = center_data['name']
                center_url = center_data['url']
                city = self._extract_city(center_name)
                address = self._extract_address(center_name)

                center, created = ExamCenter.objects.update_or_create(
                    source_url=center_url,
                    defaults={
                        'region': region,
                        'name': center_name,
                        'city': city,
                        'address': address,
                        'order': c_idx,
                    },
                )
                action = 'Created' if created else 'Updated'
                self.stdout.write(f'    {action} center: {center_name}')

        total = ExamCenter.objects.count()
        self.stdout.write(f'\nTotal: {total} centers loaded')

    def _download_all_images(self):
        centers = ExamCenter.objects.exclude(source_url='')
        self.stdout.write(f'\nDownloading images for {centers.count()} centers...')

        for center in centers:
            existing_count = center.images.count()
            if existing_count > 0:
                self.stdout.write(f'  Skip {center.name} ({existing_count} images already)')
                continue

            self.stdout.write(f'  Fetching: {center.name}')
            image_urls = self._fetch_center_images(center.source_url)

            if not image_urls:
                self.stdout.write(f'    No images found')
                continue

            self.stdout.write(f'    Found {len(image_urls)} images')
            for img_idx, img_url in enumerate(image_urls):
                try:
                    self._download_and_save_image(center, img_url, img_idx)
                    self.stdout.write(f'    Downloaded {img_idx + 1}/{len(image_urls)}')
                except Exception as e:
                    self.stderr.write(f'    Error: {e}')
                time.sleep(0.3)

            time.sleep(1)

    def _fetch_center_images(self, url):
        try:
            resp = requests.get(url, headers=HEADERS, timeout=30)
            resp.raise_for_status()
        except Exception as e:
            self.stderr.write(f'    Fetch error: {e}')
            return []

        soup = BeautifulSoup(resp.text, 'html.parser')
        article = soup.select_one('article')
        if not article:
            return []

        images = []
        for img in article.select('img'):
            src = img.get('data-src') or img.get('src', '')
            if src and not src.startswith('data:') and 'wp-content/uploads' in src:
                if not src.startswith('http'):
                    src = f'https://hsc.gov.ua{src}'
                if src not in images:
                    images.append(src)

        return images

    def _download_and_save_image(self, center, img_url, order):
        resp = requests.get(img_url, headers=HEADERS, timeout=60)
        resp.raise_for_status()

        filename = os.path.basename(img_url.split('?')[0])
        if not filename:
            filename = f'route_{center.id}_{order}.jpg'

        route_image = RouteImage(
            center=center,
            source_url=img_url,
            order=order,
        )
        route_image.image.save(filename, ContentFile(resp.content), save=True)

    def _extract_city(self, name):
        prefixes = ['м. ', 'м.', 'с. ', 'с.', 'с-ще ', 'сел. ', 'смт ', 'смт. ']
        for prefix in prefixes:
            if prefix in name:
                after = name.split(prefix, 1)[1]
                city = after.split(',')[0].strip()
                return city
        parts = name.split(',')
        if len(parts) >= 2:
            return parts[0].strip()
        return name.split('(')[0].strip()

    def _extract_address(self, name):
        if '(' in name:
            before_bracket = name.split('(')[0]
        else:
            before_bracket = name
        parts = before_bracket.split(',')
        if len(parts) >= 2:
            return ','.join(parts[1:]).strip()
        return before_bracket.strip()
