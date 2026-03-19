"""Clean up scraped theory content — fix image URLs, remove pagespeed artifacts."""
import re

from django.core.management.base import BaseCommand

from apps.theory.models import TheoryChapter

BASE = 'https://pdr-online.com.ua'


def clean_content(content):
    # Remove onerror attributes
    content = re.sub(r'\s*onerror="[^"]*"', '', content)
    content = re.sub(r"\s*onerror='[^']*'", '', content)

    # Remove data-pagespeed attributes
    content = re.sub(r'\s*data-pagespeed-[a-z-]+="[^"]*"', '', content)

    # Remove pagespeed_static images entirely
    content = re.sub(r'<img[^>]*pagespeed_static[^>]*/?\s*>', '', content)

    # Remove pagespeed scripts
    content = re.sub(r'<script[^>]*pagespeed[^>]*>.*?</script>', '', content, flags=re.DOTALL)

    # Fix broken joined URL: com.uaassets -> com.ua/assets
    content = content.replace(f'{BASE}assets/', f'{BASE}/assets/')

    # Clean pagespeed from image filenames in src attributes
    # Pattern: 36x36xFILE.png.pagespeed.ic.HASH.png -> FILE.png
    # Pattern: xFILE.png.pagespeed.ic.HASH.png -> FILE.png
    def fix_pagespeed_url(match):
        url = match.group(1)
        # Remove leading dimension prefix like 36x36x
        url = re.sub(r'/\d+x\d+x', '/', url)
        # Remove leading x prefix
        url = re.sub(r'/x([A-Z])', r'/\1', url)
        # Remove .pagespeed.ic.HASH.ext suffix
        url = re.sub(r'\.pagespeed\.\w+\.\w+\.\w+$', '', url)
        return f'src="{url}"'

    content = re.sub(r'src="([^"]*pagespeed[^"]*)"', fix_pagespeed_url, content)

    # Fix remaining relative URLs
    content = re.sub(r'src="(/assets/)', f'src="{BASE}\\1', content)

    # Remove 1.JiBnMqyl6S.gif references
    content = re.sub(r'<img[^>]*JiBnMqyl6S[^>]*/?\s*>', '', content)

    return content


class Command(BaseCommand):
    help = 'Clean up scraped theory HTML content'

    def handle(self, *args, **options):
        chapters = TheoryChapter.objects.all()
        total = chapters.count()
        fixed = 0

        for ch in chapters:
            original = ch.content
            content = clean_content(ch.content)

            if content != original:
                ch.content = content
                ch.save(update_fields=['content'])
                fixed += 1
                self.stdout.write(f'  Fixed: {ch.title[:60]}')

        self.stdout.write(self.style.SUCCESS(f'\nDone! Fixed {fixed}/{total} chapters'))
