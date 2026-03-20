"""Clean up scraped theory content — fix image URLs, convert links, remove junk."""
import re

from django.core.management.base import BaseCommand

from apps.theory.models import TheoryChapter, TheorySection

BASE = 'https://pdr-online.com.ua'

SECTION_SLUG_MAP = {
    'pravila-dorozhnogo-ruhu': 'pravila-dorozhnogo-ruhu',
    'dorozhni-znaki': 'dorozhni-znaki',
    'dorozhnya-rozmitka': 'dorozhnya-rozmitka',
    'svitlofor': 'svitlofor',
    'regulyuvalnik': 'regulyuvalnik',
    'shtrafi': 'shtrafi',
}

PARAM_MAP = {
    'pravila-dorozhnogo-ruhu': 'chapter',
    'dorozhni-znaki': 'signs',
    'dorozhnya-rozmitka': 'markings',
    'svitlofor': 'light',
    'regulyuvalnik': 'reg',
    'shtrafi': 'fine',
}

# Built at runtime — maps (section_slug, chapter_number) -> chapter_slug
_chapter_slug_cache = {}


def build_chapter_cache():
    _chapter_slug_cache.clear()
    for ch in TheoryChapter.objects.select_related('section').all():
        key = (ch.section.slug, ch.number)
        _chapter_slug_cache[key] = ch.slug


def convert_link(match):
    href = match.group(1)
    inner = match.group(2)

    # Block-level content inside <a> (sign/marking cards) — unwrap the link
    if '<div' in inner or '<li' in inner or '<ul' in inner:
        return inner

    # Individual sign/marking detail links (marking=2.1.1, sign=1) — unwrap
    if re.search(r'(?:marking|sign)=[\d.]+', href) and ('pdr-online' in href or href.startswith('/')):
        return inner

    # Internal theory links with chapter/signs params
    for src_slug, our_slug in SECTION_SLUG_MAP.items():
        if f'teoriya-pdr/{src_slug}' not in href and f'teoriya-pdr/{src_slug}' not in href.replace(BASE, ''):
            continue

        param = PARAM_MAP.get(src_slug)
        if param:
            num_match = re.search(rf'{param}=(\d+)', href)
            if num_match:
                num = int(num_match.group(1))
                ch_slug = _chapter_slug_cache.get((our_slug, num))
                if ch_slug:
                    return f'<a href="/theory/{our_slug}/{ch_slug}" class="text-primary hover:underline">{inner}</a>'

        # No param or chapter not found — link to section
        return f'<a href="/theory/{our_slug}" class="text-primary hover:underline">{inner}</a>'

    # Link to main theory page
    if href.rstrip('/').endswith('teoriya-pdr'):
        return f'<a href="/theory" class="text-primary hover:underline">{inner}</a>'

    # Links to tests on source site -> our tests
    if 'testi' in href and ('pdr-online' in href or href.startswith('/')):
        return f'<a href="/tests" class="text-primary hover:underline">{inner}</a>'

    # Their promo links -> strip
    if 'onlajn-navchannya' in href or 'fastlearning' in href or 'premium' in href:
        return inner

    # External links -> text only
    if href.startswith('http') or href.startswith('//'):
        return inner

    # Anchors, unknown -> text only
    return inner


def clean_content(content):
    # Remove JS event handler attributes
    content = re.sub(r'\s*onerror="[^"]*"', '', content)
    content = re.sub(r"\s*onerror='[^']*'", '', content)
    content = re.sub(r'\s*onload="[^"]*"', '', content)
    content = re.sub(r'\s*onclick="[^"]*"', '', content)

    # Remove data-pagespeed attributes
    content = re.sub(r'\s*data-pagespeed-[a-z-]+="[^"]*"', '', content)
    content = re.sub(r'\s*data-pagespeed-url-hash="[^"]*"', '', content)

    # Remove pagespeed_static images
    content = re.sub(r'<img[^>]*pagespeed_static[^>]*/?\s*>', '', content)

    # Remove pagespeed scripts
    content = re.sub(r'<script[^>]*pagespeed[^>]*>.*?</script>', '', content, flags=re.DOTALL)

    # Fix broken joined URL
    content = content.replace(f'{BASE}assets/', f'{BASE}/assets/')
    content = content.replace(f'{BASE}//', f'{BASE}/')

    # Clean pagespeed from image filenames
    def fix_pagespeed_url(match):
        url = match.group(1)
        # Strip pagespeed suffix: .jpg.pagespeed.ic.HASH.webp -> .jpg
        url = re.sub(r'(\.\w{2,4})\.pagespeed\.\w+\.[^."]+\.\w{2,4}$', r'\1', url)
        # Strip pagespeed resize prefixes from filename:
        #   /200x200xfilename -> /filename
        #   /600xNxfilename -> /filename
        url = re.sub(r'/\d+x\w+x', '/', url)
        # Strip leading x from filename added by pagespeed:
        #   /xsv-4.png -> /sv-4.png (lowercase too)
        url = re.sub(r'/x([a-zA-Z])', r'/\1', url)
        return f'src="{url}"'

    content = re.sub(r'src="([^"]*pagespeed[^"]*)"', fix_pagespeed_url, content)

    # Also fix URLs that were already partially cleaned by scraper
    # but still have pagespeed resize prefixes (without .pagespeed. suffix)
    def fix_pagespeed_prefix(match):
        url = match.group(1)
        url = re.sub(r'/\d+x\w+x', '/', url)
        url = re.sub(r'/x([a-zA-Z])', r'/\1', url)
        return f'src="{url}"'

    content = re.sub(r'src="([^"]*(?:/\d+x\w+x|/x[a-z])[^"]*)"', fix_pagespeed_prefix, content)

    # Fix relative image URLs
    content = re.sub(r'src="(/assets/)', f'src="{BASE}\\1', content)

    # Remove garbage gif
    content = re.sub(r'<img[^>]*JiBnMqyl6S[^>]*/?\s*>', '', content)

    # Convert links
    content = re.sub(r'<a\s+[^>]*href="([^"]*)"[^>]*>(.*?)</a>', convert_link, content, flags=re.DOTALL)

    return content


class Command(BaseCommand):
    help = 'Clean up scraped theory HTML content'

    def handle(self, *args, **options):
        build_chapter_cache()
        self.stdout.write(f'Chapter cache: {len(_chapter_slug_cache)} entries')

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
