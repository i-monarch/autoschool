"""
Full parser for vodiy.ua PDR test questions.
Parses all 117 tickets (bilet=1..117), ~2340 unique questions.
Correct answer: rel="rt1", wrong: rel="rtl"
"""

import json
import os
import re
import time

import requests
from bs4 import BeautifulSoup

BASE_URL = 'https://vodiy.ua'
COMPLECT = 6
MAX_BILET = 117

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept-Language': 'uk-UA,uk;q=0.9',
}

# Theme mapping from ticket title parsing
# Will be populated from each question's ticket info


def parse_ticket(bilet_num):
    url = f'{BASE_URL}/pdr/test/?complect={COMPLECT}&bilet={bilet_num}'
    resp = requests.get(url, headers=HEADERS)
    resp.encoding = 'utf-8'
    soup = BeautifulSoup(resp.text, 'html.parser')

    questions = []
    for li in soup.select('.ticketpage_ul li'):
        num_input = li.find('input', attrs={'name': 'question_number'})
        if not num_input:
            continue
        q_number = int(num_input.get('value', 0))

        p_tag = li.find('p')
        if not p_tag:
            continue
        q_text = p_tag.get_text(strip=True).strip('"').strip()
        if not q_text:
            continue

        # Image
        img_tag = li.select_one('.ticket_left img')
        image_url = None
        if img_tag and img_tag.get('src'):
            src = img_tag['src']
            if not src.startswith('http'):
                src = BASE_URL + src
            image_url = src

        # Answers with correct flag
        answers = []
        for label in li.select('label.label_raio'):
            radio = label.find('input', attrs={'type': 'radio'})
            span = label.select_one('.span_text')
            if not radio or not span:
                continue
            answers.append({
                'text': span.get_text(strip=True),
                'is_correct': radio.get('rel') == 'rt1',
            })

        if answers:
            questions.append({
                'number': q_number,
                'text': q_text,
                'image_url': image_url,
                'explanation': None,
                'bilet': bilet_num,
                'answers': answers,
            })

    return questions


def get_theme_mapping():
    """Parse theme list from vodiy.ua theme pages to map question numbers to themes."""
    themes_data = {}
    question_theme_map = {}

    # All themes with their IDs
    theme_ids = [
        (1, 'Загальні положення'),
        (2, "Обов'язки та права водіїв механічних транспортних засобів"),
        (3, 'Рух транспортних засобів зі спеціальними сигналами'),
        (4, "Обов'язки та права пішоходів"),
        (5, "Обов'язки та права пасажирів"),
        (6, 'Вимоги до велосипедистів'),
        (7, 'Вимоги до осіб, які керують гужовим транспортом'),
        (8, 'Регулювання дорожнього руху'),
        (9, 'Попереджувальні сигнали'),
        (10, 'Початок руху та зміна його напрямку'),
        (11, 'Розташування транспортних засобів на дорозі'),
        (12, 'Швидкість руху'),
        (13, "Дистанція, інтервал, зустрічний роз'їзд"),
        (14, 'Обгін'),
        (15, 'Зупинка та стоянка'),
        (16, 'Проїзд перехресть'),
        (17, 'Переваги маршрутних транспортних засобів'),
        (18, 'Проїзд пішохідних переходів та зупинок'),
        (19, 'Користування зовнішніми світловими приладами'),
        (20, 'Рух через залізничні переїзди'),
        (21, 'Перевезення пасажирів'),
        (22, 'Перевезення вантажу'),
        (23, 'Буксирування та експлуатація транспортних составів'),
        (24, 'Навчальна їзда'),
        (25, 'Рух транспортних засобів у колонах'),
        (26, 'Рух у житловій та пішохідній зоні'),
        (27, 'Рух по автомагістралях та дорогах для автомобілів'),
        (28, 'Рух по гірських дорогах та на крутих спусках'),
        (29, 'Міжнародний рух'),
        (30, 'Номерні, розпізнавальні знаки, написи та позначення'),
        (31, 'Будова, технічний стан та обладнання транспортних засобів'),
        (32, 'Окремі питання ПДР, що потребують узгодження'),
        (33, 'Дорожні знаки'),
        (34, 'Дорожня розмітка'),
        (35, 'Основи безпечного водіння'),
        (36, 'Основи права в області дорожнього руху'),
        (37, 'Основи надання домедичної допомоги при ДТП'),
        (38, 'Попереджувальні знаки'),
        (39, 'Знаки пріоритету'),
        (40, 'Заборонні знаки'),
        (41, 'Наказові знаки'),
        (42, 'Інформаційно-вказівні знаки'),
        (43, 'Знаки сервісу'),
        (44, 'Таблички до дорожніх знаків'),
        (45, 'Горизонтальна розмітка'),
        (46, 'Вертикальна розмітка'),
        (47, 'Регульовані перехрестя'),
        (48, 'Нерегульовані перехрестя'),
        (121, 'Європротокол'),
        (122, 'Додаткові питання B1/B (Юридична відповідальність)'),
        (123, 'Етика водіння, культура та відпочинок водія'),
        (124, 'Додаткові питання B1/B (Безпека)'),
        (125, 'Додаткові питання A1/A (Загальні)'),
        (126, 'Додаткові питання A1/A (Будова і терміни)'),
        (127, 'Додаткові питання A1/A (Юридична відповідальність)'),
        (128, 'Додаткові питання A1/A (Безпека)'),
        (129, 'Додаткові питання C1/C (Загальні)'),
        (130, 'Додаткові питання C1/C (Будова і терміни)'),
        (131, 'Додаткові питання C1/C (Юридична відповідальність)'),
        (132, 'Додаткові питання C1/C (Безпека)'),
        (133, 'Додаткові питання D1/D (Загальні)'),
        (134, 'Додаткові питання D1/D (Будова і терміни)'),
        (135, 'Додаткові питання D1/D (Юридична відповідальність)'),
        (136, 'Додаткові питання D1/D (Безпека)'),
        (137, 'Додаткові питання BE/CE/DE (Загальні)'),
        (138, 'Додаткові питання BE/CE/DE (Будова і терміни)'),
        (139, 'Додаткові питання BE/CE/DE (Юридична відповідальність)'),
        (140, 'Додаткові питання BE/CE/DE (Безпека)'),
        (141, 'Додаткові питання T (Загальні)'),
        (142, 'Додаткові питання T (Будова і терміни)'),
        (143, 'Додаткові питання T (Юридична відповідальність)'),
        (144, 'Додаткові питання T (Безпека)'),
        (145, 'Додаткові питання B1/B (Загальні)'),
        (146, 'Додаткові питання B1/B (Будова і терміни)'),
        (149, 'Оновлені питання 2026'),
    ]

    print('Building theme mapping...')
    for theme_id, theme_name in theme_ids:
        themes_data[theme_id] = theme_name

        # Fetch first page of theme to get question numbers
        url = f'{BASE_URL}/pdr/test/?complect={COMPLECT}&theme={theme_id}'
        try:
            resp = requests.get(url, headers=HEADERS)
            resp.encoding = 'utf-8'
            soup = BeautifulSoup(resp.text, 'html.parser')

            # Get total pages
            page_count = 1
            pt = soup.find(string=re.compile(r'Сторінка \d+ з \d+'))
            if pt:
                m = re.search(r'Сторінка \d+ з (\d+)', pt)
                if m:
                    page_count = int(m.group(1))

            # Collect question numbers from all pages
            for page in range(1, page_count + 1):
                if page > 1:
                    resp = requests.get(f'{url}&page={page}', headers=HEADERS)
                    resp.encoding = 'utf-8'
                    soup = BeautifulSoup(resp.text, 'html.parser')
                    time.sleep(0.2)

                for q in soup.select('input[name=question_number]'):
                    qnum = int(q.get('value', 0))
                    if qnum not in question_theme_map:
                        question_theme_map[qnum] = {'id': theme_id, 'name': theme_name}

            print(f'  [{theme_id:>3}] {theme_name}')
        except Exception as e:
            print(f'  [{theme_id:>3}] ERROR: {e}')

        time.sleep(0.3)

    return themes_data, question_theme_map


def main():
    # Step 1: Build theme mapping
    themes_data, question_theme_map = get_theme_mapping()
    print(f'\nMapped {len(question_theme_map)} questions to themes\n')

    # Step 2: Parse all tickets
    print(f'Parsing {MAX_BILET} tickets...\n')
    all_questions = []
    seen = set()

    for bilet in range(1, MAX_BILET + 1):
        print(f'  Bilet {bilet:>3}/117...', end=' ', flush=True)
        try:
            questions = parse_ticket(bilet)
            new = 0
            for q in questions:
                if q['number'] not in seen:
                    seen.add(q['number'])
                    # Attach theme info
                    theme_info = question_theme_map.get(q['number'], {'id': 0, 'name': 'Без теми'})
                    q['theme_id'] = theme_info['id']
                    q['theme_name'] = theme_info['name']
                    all_questions.append(q)
                    new += 1
            print(f'{len(questions)} parsed, {new} new (total: {len(all_questions)})')
        except Exception as e:
            print(f'ERROR: {e}')

        time.sleep(0.3)

    # Stats
    total = len(all_questions)
    with_img = sum(1 for q in all_questions if q['image_url'])
    with_correct = sum(1 for q in all_questions if any(a['is_correct'] for a in q['answers']))
    no_theme = sum(1 for q in all_questions if q.get('theme_id') == 0)

    print(f'\n{"="*50}')
    print(f'Total unique questions: {total}')
    print(f'With images: {with_img}')
    print(f'With correct answer: {with_correct}')
    print(f'Without theme: {no_theme}')
    print(f'{"="*50}')

    # Build theme summary
    theme_map = {}
    for q in all_questions:
        tid = q['theme_id']
        if tid not in theme_map:
            theme_map[tid] = {'id': tid, 'name': q['theme_name'], 'question_count': 0}
        theme_map[tid]['question_count'] += 1

    output = {
        'meta': {
            'source': 'vodiy.ua',
            'complect': 'Нові 2026',
            'total_questions': total,
            'total_themes': len(theme_map),
            'total_tickets': MAX_BILET,
            'parsed_at': time.strftime('%Y-%m-%d %H:%M:%S'),
        },
        'themes': sorted(theme_map.values(), key=lambda t: t['id']),
        'questions': all_questions,
    }

    out_path = os.path.join(os.path.dirname(__file__), 'pdr_questions.json')
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f'\nSaved to {out_path}')


if __name__ == '__main__':
    main()
