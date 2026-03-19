"""Clean up scraped theory content — fix image URLs, convert links, remove junk."""
import re

from django.core.management.base import BaseCommand

from apps.theory.models import TheoryChapter, TheorySection

BASE = 'https://pdr-online.com.ua'

# Map source URL patterns to our internal routes
SECTION_SLUG_MAP = {
    'pravila-dorozhnogo-ruhu': 'pravila-dorozhnogo-ruhu',
    'dorozhni-znaki': 'dorozhni-znaki',
    'dorozhnya-rozmitka': 'dorozhnya-rozmitka',
    'svitlofor': 'svitlofor',
    'regulyuvalnik': 'regulyuvalnik',
    'shtrafi': 'shtrafi',
}


def convert_link(match):
    full_tag = match.group(0)
    href = match.group(1)
    inner = match.group(2)

    # Internal theory links — convert to our routes
    # /teoriya-pdr/dorozhni-znaki/ -> /theory/dorozhni-znaki
    # /teoriya-pdr/dorozhni-znaki/?signs=3 -> /theory/dorozhni-znaki
    # /teoriya-pdr/pravila-dorozhnogo-ruhu/?chapter=5 -> /theory/pravila-dorozhnogo-ruhu
    for src_slug, our_slug in SECTION_SLUG_MAP.items():
        if f'teoriya-pdr/{src_slug}' in href or f'teoriya-pdr/{src_slug}' in href.replace(BASE, ''):
            return f'<a href="/theory/{our_slug}">{inner}</a>'

    # Link to main theory page
    if href.rstrip('/').endswith('teoriya-pdr') or href.rstrip('/') == f'{BASE}/teoriya-pdr':
        return f'<a href="/theory">{inner}</a>'

    # Links to tests on source site -> our tests
    if 'testi' in href and 'pdr-online' in href:
        return f'<a href="/tests">{inner}</a>'

    # Links to their online learning -> strip (we don't have this)
    if 'onlajn-navchannya' in href or 'fastlearning' in href or 'premium' in href:
        return inner

    # External links (wikipedia, zakon.rada, etc) — strip href, keep text
    if href.startswith('http') or href.startswith('//'):
        return inner

    # Anchor links (#) — keep text only
    if href.startswith('#'):
        return inner

    # Anything else — keep text only
    return inner


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

    # Clean pagespeed from image filenames
    def fix_pagespeed_url(match):
        url = match.group(1)
        url = re.sub(r'/\d+x\d+x', '/', url)
        url = re.sub(r'/x([A-Z])', r'/\1', url)
        url = re.sub(r'(\.\w{2,4})\.pagespeed\.\w+\.[^."]+\.\w{2,4}$', r'\1', url)
        return f'src="{url}"'

    content = re.sub(r'src="([^"]*pagespeed[^"]*)"', fix_pagespeed_url, content)

    # Fix remaining relative image URLs
    content = re.sub(r'src="(/assets/)', f'src="{BASE}\\1', content)

    # Remove garbage gif references
    content = re.sub(r'<img[^>]*JiBnMqyl6S[^>]*/?\s*>', '', content)

    # Convert links: internal -> our routes, external -> text only
    content = re.sub(r'<a\s+[^>]*href="([^"]*)"[^>]*>(.*?)</a>', convert_link, content, flags=re.DOTALL)

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
