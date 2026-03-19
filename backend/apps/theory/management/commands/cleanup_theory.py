"""Clean up scraped theory content — fix image URLs, remove pagespeed artifacts."""
import re

from django.core.management.base import BaseCommand

from apps.theory.models import TheoryChapter

BASE = 'https://pdr-online.com.ua'


class Command(BaseCommand):
    help = 'Clean up scraped theory HTML content'

    def handle(self, *args, **options):
        chapters = TheoryChapter.objects.all()
        total = chapters.count()
        fixed = 0

        for ch in chapters:
            original = ch.content
            content = ch.content

            # Remove onerror attributes
            content = re.sub(r'\s*onerror="[^"]*"', '', content)
            content = re.sub(r"\s*onerror='[^']*'", '', content)

            # Fix pagespeed URLs in src — convert to clean originals
            # Pattern: xFILENAME.png.pagespeed.ic.HASH.png -> FILENAME.png
            content = re.sub(
                r'(/[^"\']+/)x([^"\']+\.(?:png|jpg|jpeg|gif|webp|svg))\.pagespeed\.[^"\']+\.(?:png|jpg|jpeg|gif|webp|svg)',
                r'\1\2',
                content,
                flags=re.IGNORECASE,
            )

            # Fix broken URLs: https://pdr-online.com.uapagespeed_static/...
            content = content.replace('https://pdr-online.com.uapagespeed_static/', '')

            # Remove pagespeed_static gif references entirely
            content = re.sub(r'<img[^>]*pagespeed_static[^>]*/?>', '', content)

            # Fix relative URLs missing BASE
            content = re.sub(
                r'src="(assets/)',
                f'src="{BASE}/\\1',
                content,
            )

            # Remove data-pagespeed attributes
            content = re.sub(r'\s*data-pagespeed-[a-z-]+="[^"]*"', '', content)

            # Remove empty pagespeed scripts
            content = re.sub(r'<script[^>]*pagespeed[^>]*>.*?</script>', '', content, flags=re.DOTALL)

            if content != original:
                ch.content = content
                ch.save(update_fields=['content'])
                fixed += 1
                self.stdout.write(f'  Fixed: {ch.title[:60]}')

        self.stdout.write(self.style.SUCCESS(f'\nDone! Fixed {fixed}/{total} chapters'))
