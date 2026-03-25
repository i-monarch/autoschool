import os
import time
import requests
from urllib.parse import urljoin
from io import BytesIO

from bs4 import BeautifulSoup
from django.core.files.base import ContentFile
from django.core.management.base import BaseCommand

from apps.routes.models import Region, ExamCenter, RouteImage


BASE_URL = 'https://hsc.gov.ua/index/poslugi/vidacha-posvidchennya-vodiya/marshruti/'
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
}


class Command(BaseCommand):
    help = 'Scrape exam routes from hsc.gov.ua'

    def add_arguments(self, parser):
        parser.add_argument('--dry-run', action='store_true', help='Only show what would be scraped')
        parser.add_argument('--skip-images', action='store_true', help='Skip downloading images')

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        skip_images = options['skip_images']

        self.stdout.write('Fetching main page...')
        resp = requests.get(BASE_URL, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, 'html.parser')

        content = soup.select_one('.entry-content')
        if not content:
            self.stderr.write('Could not find .entry-content')
            return

        regions_data = self._parse_main_page(content)
        self.stdout.write(f'Found {len(regions_data)} regions')

        for idx, region_data in enumerate(regions_data):
            region_name = region_data['name']
            centers = region_data['centers']
            self.stdout.write(f'\n--- Region: {region_name} ({len(centers)} centers) ---')

            if dry_run:
                for c in centers:
                    self.stdout.write(f'  {c["name"]} -> {c["url"]}')
                continue

            region, _ = Region.objects.update_or_create(
                name=region_name,
                defaults={'order': idx},
            )

            for c_idx, center_data in enumerate(centers):
                self._process_center(region, center_data, c_idx, skip_images)
                time.sleep(1)

        self.stdout.write(self.style.SUCCESS('\nDone!'))

    def _parse_main_page(self, content):
        import re

        html = str(content)
        regions = []

        # BS4 breaks DOM with invalid div-inside-ul, so parse with regex
        # Find all li.select headers
        li_pattern = re.compile(
            r'<li[^>]*class="select"[^>]*>(.*?)</li>',
            re.DOTALL
        )
        gohide_pattern = re.compile(
            r'<div[^>]*class="gohide"[^>]*>(.*?)</div>\s*</div>\s*<p',
            re.DOTALL
        )

        # Split content by li.select to pair each header with its gohide block
        li_matches = list(li_pattern.finditer(html))
        gohide_matches = list(re.finditer(
            r'<div[^>]*class="gohide"[^>]*>(.*?)(?=<li[^>]*class="select"|$)',
            html, re.DOTALL
        ))

        self.stdout.write(f'  Found {len(li_matches)} region headers, {len(gohide_matches)} content blocks')

        for i, li_match in enumerate(li_matches):
            region_name = re.sub(r'<[^>]+>', '', li_match.group(1)).strip()

            centers = []
            if i < len(gohide_matches):
                block_html = gohide_matches[i].group(1)
                link_pattern = re.compile(
                    r'<a[^>]*href="(https?://hsc\.gov\.ua/[^"]+)"[^>]*>([^<]*)</a>',
                    re.DOTALL
                )
                seen_urls = set()
                for link_match in link_pattern.finditer(block_html):
                    url = link_match.group(1)
                    name = link_match.group(2).strip()
                    if name and url and url not in seen_urls:
                        seen_urls.add(url)
                        centers.append({'name': name, 'url': url})

            regions.append({'name': region_name, 'centers': centers})

        return regions

    def _process_center(self, region, center_data, order, skip_images):
        center_name = center_data['name']
        center_url = center_data['url']

        city = self._extract_city(center_name)
        address = self._extract_address(center_name)

        self.stdout.write(f'  Processing: {center_name}')

        center, created = ExamCenter.objects.update_or_create(
            source_url=center_url,
            defaults={
                'region': region,
                'name': center_name,
                'city': city,
                'address': address,
                'order': order,
            },
        )

        action = 'Created' if created else 'Updated'
        self.stdout.write(f'    {action} center: {center.name}')

        if skip_images:
            return

        image_urls = self._fetch_center_images(center_url)
        self.stdout.write(f'    Found {len(image_urls)} images')

        existing_sources = set(center.images.values_list('source_url', flat=True))

        for img_idx, img_url in enumerate(image_urls):
            if img_url in existing_sources:
                continue

            try:
                self._download_and_save_image(center, img_url, img_idx)
                self.stdout.write(f'    Downloaded image {img_idx + 1}/{len(image_urls)}')
            except Exception as e:
                self.stderr.write(f'    Error downloading {img_url}: {e}')

            time.sleep(0.5)

    def _fetch_center_images(self, url):
        try:
            resp = requests.get(url, headers=HEADERS, timeout=30)
            resp.raise_for_status()
        except Exception as e:
            self.stderr.write(f'    Error fetching {url}: {e}')
            return []

        soup = BeautifulSoup(resp.text, 'html.parser')
        article = soup.select_one('article')
        if not article:
            return []

        images = []
        for img in article.select('img'):
            src = img.get('data-src') or img.get('src', '')
            if src and not src.startswith('data:') and 'wp-content/uploads' in src:
                full_url = urljoin(url, src)
                if full_url not in images:
                    images.append(full_url)

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
        text = name
        for prefix in prefixes:
            if prefix in text:
                after = text.split(prefix, 1)[1]
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
