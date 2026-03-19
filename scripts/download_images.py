"""
Download all PDR question images from vodiy.ua to local storage.
Updates pdr_questions.json with local paths.
"""

import json
import os
import time
import requests

HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Referer': 'https://vodiy.ua/pdr/test/',
}

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
JSON_PATH = os.path.join(SCRIPT_DIR, 'pdr_questions.json')
IMG_DIR = os.path.join(SCRIPT_DIR, '..', 'backend', 'media', 'questions')


def main():
    os.makedirs(IMG_DIR, exist_ok=True)

    with open(JSON_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    total = 0
    downloaded = 0
    skipped = 0
    errors = 0

    for q in data['questions']:
        if not q.get('image_url'):
            continue
        total += 1

        url = q['image_url']
        filename = url.split('/')[-1]
        local_path = os.path.join(IMG_DIR, filename)

        # Update path in JSON to relative media path
        q['image_url'] = f'/media/questions/{filename}'

        if os.path.exists(local_path):
            skipped += 1
            continue

        try:
            resp = requests.get(url, headers=HEADERS, timeout=10)
            if resp.status_code == 200 and len(resp.content) > 100:
                with open(local_path, 'wb') as f:
                    f.write(resp.content)
                downloaded += 1
                if downloaded % 50 == 0:
                    print(f'  Downloaded {downloaded}...')
            else:
                print(f'  SKIP {filename}: status={resp.status_code}, size={len(resp.content)}')
                errors += 1
        except Exception as e:
            print(f'  ERROR {filename}: {e}')
            errors += 1

        time.sleep(0.1)

    # Save updated JSON
    with open(JSON_PATH, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f'\nDone! Total with images: {total}')
    print(f'Downloaded: {downloaded}, skipped (exists): {skipped}, errors: {errors}')


if __name__ == '__main__':
    main()
