"""
Scrape theory content from pdr-online.com.ua

Usage:
    python manage.py scrape_theory
    python manage.py scrape_theory --section pravila-dorozhnogo-ruhu
    python manage.py scrape_theory --clear
"""
import re
import time

import requests
from bs4 import BeautifulSoup
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from apps.theory.models import TheorySection, TheoryChapter

BASE = 'https://pdr-online.com.ua'
HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
}

SECTIONS = [
    {
        'title': 'Правила дорожнього руху',
        'slug': 'pravila-dorozhnogo-ruhu',
        'icon': 'BookOpen',
        'description': 'ПДР України 2025 — повний текст правил',
        'url': '/teoriya-pdr/pravila-dorozhnogo-ruhu/',
        'param': 'chapter',
    },
    {
        'title': 'Дорожні знаки',
        'slug': 'dorozhni-znaki',
        'icon': 'SignpostBig',
        'description': 'Попереджувальні, заборонні, наказові та інші знаки',
        'url': '/teoriya-pdr/dorozhni-znaki/',
        'param': 'signs',
    },
    {
        'title': 'Дорожня розмітка',
        'slug': 'dorozhnya-rozmitka',
        'icon': 'Route',
        'description': 'Горизонтальна та вертикальна розмітка доріг',
        'url': '/teoriya-pdr/dorozhnya-rozmitka/',
        'param': 'marking',
    },
    {
        'title': 'Світлофор',
        'slug': 'svitlofor',
        'icon': 'CircleDot',
        'description': 'Сигнали світлофорів та їх значення',
        'url': '/teoriya-pdr/svitlofor/',
        'param': 'light',
    },
    {
        'title': 'Регулювальник',
        'slug': 'regulyuvalnik',
        'icon': 'UserCheck',
        'description': 'Сигнали та жести регулювальника',
        'url': '/teoriya-pdr/regulyuvalnik/',
        'param': 'reg',
    },
    {
        'title': 'Штрафи ПДР',
        'slug': 'shtrafi',
        'icon': 'Receipt',
        'description': 'Штрафи за порушення правил дорожнього руху',
        'url': '/teoriya-pdr/shtrafi/',
        'param': 'fine',
    },
]


def fetch(url, retries=3):
    for attempt in range(retries):
        try:
            resp = requests.get(url, headers=HEADERS, timeout=30)
            if resp.status_code == 429:
                wait = 5 * (attempt + 1)
                print(f'  429 rate limit, waiting {wait}s...')
                time.sleep(wait)
                continue
            resp.raise_for_status()
            return resp.text
        except requests.RequestException as e:
            if attempt < retries - 1:
                time.sleep(3)
            else:
                raise
    return None


def extract_chapters_from_section_page(html, param):
    """Extract chapter links from section listing page."""
    soup = BeautifulSoup(html, 'html.parser')
    chapters = []

    # Find all links with the query param
    for link in soup.find_all('a', href=True):
        href = link['href']
        if f'{param}=' in href:
            match = re.search(rf'{param}=(\d+)', href)
            if match:
                num = int(match.group(1))
                # Try to get short title from span/div first
                title_el = link.find('span') or link.find('div')
                title = title_el.get_text(strip=True) if title_el else link.get_text(strip=True)
                # Clean: remove leading number if present
                title = re.sub(r'^\s*"?\d+"?\s*', '', title).strip()
                # Truncate long titles
                if len(title) > 150:
                    title = title[:147] + '...'
                if not title:
                    title = f'Розділ {num}'
                chapters.append({
                    'number': num,
                    'title': title,
                    'url': href if href.startswith('http') else BASE + href,
                })

    # Deduplicate by number
    seen = set()
    unique = []
    for ch in chapters:
        if ch['number'] not in seen:
            seen.add(ch['number'])
            unique.append(ch)
    return sorted(unique, key=lambda x: x['number'])


def extract_content(html):
    """Extract main article content as clean HTML."""
    soup = BeautifulSoup(html, 'html.parser')

    # Try common content containers
    content_el = None
    for selector in ['.theory-content', '.article-content', '.content-text',
                     'article', '.entry-content']:
        content_el = soup.select_one(selector)
        if content_el:
            break

    if not content_el:
        # Fallback: find main content area
        main = soup.find('main')
        if main:
            # Get all text blocks after the chapter list
            content_el = main

    if not content_el:
        return ''

    # Clean up: remove scripts, styles, ads, nav elements
    for tag in content_el.find_all(['script', 'style', 'iframe', 'noscript']):
        tag.decompose()
    for tag in content_el.find_all(class_=re.compile(r'ad|banner|promo|widget|social|share|related|footer|header|nav|breadcrumb|sticky')):
        tag.decompose()

    # Fix image URLs to absolute
    for img in content_el.find_all('img'):
        src = img.get('src', '')
        if src and not src.startswith(('http', 'data:')):
            img['src'] = BASE + src
        # Remove lazy-load attributes that might break
        for attr in ['data-src', 'data-lazy', 'loading']:
            if img.has_attr(attr):
                if attr == 'data-src' and img[attr]:
                    img['src'] = img[attr] if img[attr].startswith('http') else BASE + img[attr]
                del img[attr]

    # Convert to string
    content = str(content_el)

    # Clean whitespace
    content = re.sub(r'\n\s*\n', '\n', content)
    return content.strip()


def extract_chapter_content(url):
    """Fetch a chapter page and extract its content."""
    html = fetch(url)
    if not html:
        return ''

    soup = BeautifulSoup(html, 'html.parser')
    main = soup.find('main')
    if not main:
        return ''

    # Remove chapter list/navigation
    for ul in main.find_all('ul'):
        links = ul.find_all('a', href=True)
        if links and any('chapter=' in (a.get('href', '') or '') for a in links):
            ul.decompose()
            continue
        if links and any('signs=' in (a.get('href', '') or '') for a in links):
            ul.decompose()
            continue

    # Remove breadcrumbs
    for bc in main.find_all('ul'):
        if bc.find('a', href='/'):
            bc.decompose()

    # Remove h1 (section title)
    h1 = main.find('h1')
    if h1:
        h1.decompose()

    # Remove subtitle
    for div in main.find_all('div', recursive=False):
        text = div.get_text(strip=True)
        if text and len(text) < 100 and 'курс' in text.lower():
            div.decompose()
            break

    # Clean scripts, styles, ads
    for tag in main.find_all(['script', 'style', 'iframe', 'noscript']):
        tag.decompose()
    for tag in main.find_all(class_=re.compile(r'ad|banner|promo|widget|social|share|related|sticky-header')):
        tag.decompose()

    # Fix image URLs
    for img in main.find_all('img'):
        src = img.get('data-src') or img.get('src', '')
        if src and not src.startswith(('http', 'data:')):
            src = BASE + src
        img['src'] = src
        for attr in ['data-src', 'data-lazy', 'loading', 'srcset', 'data-srcset']:
            if img.has_attr(attr):
                del img[attr]
        if not img.get('alt'):
            img['alt'] = ''

    # Fix links to absolute
    for a in main.find_all('a', href=True):
        href = a['href']
        if href and not href.startswith(('http', '#', 'mailto:', 'tel:')):
            a['href'] = BASE + href

    content = str(main)
    content = re.sub(r'\n\s*\n', '\n', content)
    return content.strip()


class Command(BaseCommand):
    help = 'Scrape theory content from pdr-online.com.ua'

    def add_arguments(self, parser):
        parser.add_argument('--section', type=str, help='Scrape only this section slug')
        parser.add_argument('--clear', action='store_true', help='Clear all theory data before scraping')

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            TheoryChapter.objects.all().delete()
            TheorySection.objects.all().delete()

        sections_to_scrape = SECTIONS
        if options.get('section'):
            sections_to_scrape = [s for s in SECTIONS if s['slug'] == options['section']]
            if not sections_to_scrape:
                self.stderr.write(f'Section not found: {options["section"]}')
                return

        for i, sec_data in enumerate(sections_to_scrape):
            self.stdout.write(f'\n=== {sec_data["title"]} ===')

            section, _ = TheorySection.objects.update_or_create(
                slug=sec_data['slug'],
                defaults={
                    'title': sec_data['title'],
                    'description': sec_data['description'],
                    'icon': sec_data['icon'],
                    'order': i,
                }
            )

            # Fetch section page
            url = BASE + sec_data['url']
            self.stdout.write(f'  Fetching {url}')
            html = fetch(url)
            if not html:
                self.stderr.write(f'  Failed to fetch section page')
                continue

            chapters = extract_chapters_from_section_page(html, sec_data['param'])
            self.stdout.write(f'  Found {len(chapters)} chapters')

            if not chapters:
                # Some sections have content directly on the page (e.g. svitlofor)
                self.stdout.write(f'  No chapters found, saving page as single chapter')
                content = extract_chapter_content(url)
                if content:
                    TheoryChapter.objects.update_or_create(
                        section=section,
                        slug='main',
                        defaults={
                            'title': sec_data['title'],
                            'number': 1,
                            'content': content,
                            'order': 0,
                        }
                    )
                    section.chapters_count = 1
                    section.save(update_fields=['chapters_count'])
                continue

            for j, ch in enumerate(chapters):
                self.stdout.write(f'  [{j+1}/{len(chapters)}] {ch["title"]}')
                time.sleep(1.5)  # rate limit

                content = extract_chapter_content(ch['url'])
                ch_slug = slugify(ch['title'][:60], allow_unicode=True)[:190] or f'chapter-{ch["number"]}'

                TheoryChapter.objects.update_or_create(
                    section=section,
                    slug=ch_slug,
                    defaults={
                        'title': ch['title'],
                        'number': ch['number'],
                        'content': content,
                        'order': j,
                    }
                )

            section.chapters_count = len(chapters)
            section.save(update_fields=['chapters_count'])
            self.stdout.write(self.style.SUCCESS(f'  Saved {len(chapters)} chapters'))

        self.stdout.write(self.style.SUCCESS('\nDone!'))
