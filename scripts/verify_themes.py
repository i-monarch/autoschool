"""Compare counts in pdr_questions.json vs live site counts per theme."""

import json
import os
import time
import re
import requests
from bs4 import BeautifulSoup

BASE = 'https://vodiy.ua'
COMPLECT = 6
HEADERS = {'User-Agent': 'Mozilla/5.0', 'Accept-Language': 'uk-UA,uk;q=0.9'}

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))


def site_counts(theme_ids):
    counts = {}
    for tid, name in theme_ids:
        url = f'{BASE}/pdr/test/?complect={COMPLECT}&theme={tid}'
        r = requests.get(url, headers=HEADERS, timeout=15)
        r.encoding = 'utf-8'
        soup = BeautifulSoup(r.text, 'html.parser')
        pt = soup.find(string=re.compile(r'Сторінка[\s\u00a0]+\d+[\s\u00a0]+з[\s\u00a0]+\d+'))
        page_count = 1
        if pt:
            m = re.search(r'Сторінка[\s\u00a0]+\d+[\s\u00a0]+з[\s\u00a0]+(\d+)', pt)
            if m:
                page_count = int(m.group(1))
        qset = set()
        for page in range(1, page_count + 1):
            if page > 1:
                r = requests.get(f'{url}&part={page}', headers=HEADERS, timeout=15)
                r.encoding = 'utf-8'
                soup = BeautifulSoup(r.text, 'html.parser')
                time.sleep(0.2)
            for q in soup.select('input[name=question_number]'):
                qset.add(int(q.get('value', 0)))
        counts[tid] = (name, len(qset))
        time.sleep(0.2)
    return counts


def main():
    json_path = os.path.join(SCRIPT_DIR, 'pdr_questions.json')
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    our_by_theme = {}
    for q in data['questions']:
        tid = q.get('theme_id', 0)
        our_by_theme.setdefault(tid, 0)
        our_by_theme[tid] += 1

    from parse_pdr import get_theme_mapping
    import parse_pdr
    theme_ids = [
        (t['id'], t['name']) for t in data['themes']
        if t['id'] != 0
    ]
    theme_ids.sort(key=lambda x: x[0])

    print('Fetching live counts from vodiy.ua...')
    site = site_counts(theme_ids)

    print()
    print(f'{"tid":>4} | {"name":<45} | {"site":>5} | {"ours":>5} | {"delta":>6}')
    print('-' * 80)

    total_site = 0
    total_ours_mapped = 0
    ok_themes = 0
    diff_themes = 0

    for tid, (name, site_cnt) in sorted(site.items()):
        ours = our_by_theme.get(tid, 0)
        delta = site_cnt - ours
        marker = '' if delta == 0 else '  <-- MISMATCH'
        short = name if len(name) < 45 else name[:42] + '...'
        print(f'{tid:>4} | {short:<45} | {site_cnt:>5} | {ours:>5} | {delta:>+6}{marker}')
        total_site += site_cnt
        total_ours_mapped += ours
        if delta == 0:
            ok_themes += 1
        else:
            diff_themes += 1

    no_theme = our_by_theme.get(0, 0)
    total_questions = len(data['questions'])

    print('-' * 80)
    print(f'Total questions in JSON: {total_questions}')
    print(f'With theme_id=0 (Без теми): {no_theme}')
    print(f'Themes matching site: {ok_themes}/{len(site)}')
    print(f'Themes with mismatch: {diff_themes}')
    print(f'Sum over all themes (site memberships): {total_site}')
    print(f'Sum over all themes (our memberships): {total_ours_mapped}')


if __name__ == '__main__':
    main()
