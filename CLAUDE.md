# AutoSchool Platform

Онлайн-платформа для автошколы: видео-обучение, тесты ПДД, онлайн-занятия, личный кабинет, онлайн-оплата.

**Детальные справочники** (читать при работе над соответствующей областью):
- `CLAUDE_SECURITY.md` — безопасность, обработка ошибок, логирование, тестирование, миграции, деплой
- `CLAUDE_UI.md` — UI/UX, адаптивность, DaisyUI, компоненты, a11y
- `CLAUDE_INFRA.md` — оптимизация, VPS ресурсы, Celery задачи, Redis ключи, мониторинг

**Модели, API endpoints, Docker Compose, зависимости, .env** — смотреть в самом коде (models.py, urls.py, docker-compose.yml, requirements/, package.json, .env.example).

---

## Стек

| Компонент | Технология |
|---|---|
| Backend | Python 3.12, Django 5.x, DRF |
| Async | django-channels, channels-redis |
| Tasks | Celery + Redis, django-celery-beat |
| Frontend | Next.js 14 (App Router), TypeScript strict, Tailwind + DaisyUI |
| State | Zustand |
| DB | PostgreSQL 16 |
| Cache | Redis 7 |
| Video | FFmpeg → HLS, S3 + CDN |
| Payments | LiqPay / Monobank |
| Infra | Docker Compose, Nginx, SSL, Gunicorn + Uvicorn |

---

## Структура проекта

```
autoschool/
├── backend/
│   ├── config/          # settings/, urls.py, celery.py, asgi.py
│   ├── apps/
│   │   ├── core/        # permissions, миксины, утилиты
│   │   ├── users/       # User, UserDevice, UserSession, JWT auth
│   │   ├── courses/     # Category, Course, Lesson, LessonProgress
│   │   ├── video/       # Video, HLS, signed URLs
│   │   ├── testing/     # Question, Answer, Test, TestAttempt
│   │   ├── schedule/    # TimeSlot, Booking
│   │   ├── situations/  # Situation, SituationMedia, Comments
│   │   ├── payments/    # Tariff, PromoCode, Payment, Subscription
│   │   ├── notifications/
│   │   ├── blog/        # Article, ArticleTag
│   │   └── chat/        # ChatRoom, Message (WebSocket)
│   └── locale/uk/
├── frontend/
│   └── src/
│       ├── app/         # (public)/, (auth)/, (student)/, (teacher)/, (admin)/
│       ├── components/  # ui/, layout/, video/, testing/, chat/, dashboard/
│       ├── lib/         # api.ts, auth.ts, utils.ts
│       ├── hooks/
│       ├── stores/      # Zustand
│       ├── types/
│       └── i18n/
└── nginx/
```

---

## КРИТИЧЕСКИЕ ПРАВИЛА

1. **НИКОГДА не удалять БД** — ни DROP DATABASE, ни `docker volume rm`, ни flush, ни migrate --run-syncdb с нуля
2. **НИКОГДА `docker compose down -v`** — флаг `-v` удаляет volumes
3. **НИКОГДА `manage.py flush`** — очищает все таблицы
4. **НИКОГДА не удалять примененные миграции**
5. **НИКОГДА DROP TABLE / TRUNCATE / DELETE без WHERE** на проде
6. **НИКОГДА `git push --force` в main/develop**
7. **НИКОГДА секреты в коде** — только .env
8. **Перед деструктивной операцией — спросить** и объяснить последствия
9. **НИКОГДА не использовать `alert()`, `confirm()`, `prompt()`** — вместо них кастомные UI-компоненты (модалки, inline-элементы, toast)

Пересоздать БД в dev — спросить. Сбросить данные — предложить `pg_dump` сначала. В проде деструктивные операции ЗАПРЕЩЕНЫ без подтверждения.

---

## Стиль кода

- **Никаких эмодзи** — ни в коде, ни в коммитах, ни в UI-текстах
- **Без шаблонных AI-комментариев** — комментарий только если логика неочевидна, коротко
- **Естественные имена**: `get_active_subscription`, не `retrieve_current_user_active_subscription_instance`
- **Без лишних абстракций** — если код используется один раз, не выносить в утилиту
- **Комментарии на английском**, UI-тексты на украинском (i18n)
- **Коммиты**: `feat: add payment webhook handler`, не `feat: implement a comprehensive...`
- **Без избыточных docstring** к очевидным методам
- **Разнообразие** — не повторять паттерны механически

---

## Правила кода

### Размер файлов
- Максимум ~300 строк на файл, разбивать на модули при росте
- Frontend: один компонент = один файл, >200 строк — разбить
- Исключение: settings, конфиги, миграции

### Backend — Django
- Каждое app: models, serializers, views, urls, permissions, services, tasks, admin
- **Бизнес-логика в `services.py`**, не в views/serializers
- **Валидация в `serializers.py`**, не в views
- ViewSet + Router для CRUD, APIView для кастомных
- Все API под `/api/v1/`
- django-filter для фильтрации
- Кастомные permissions: `IsStudent`, `IsTeacher`, `IsAdmin`, `IsSubscriptionActive`
- Строки через `gettext_lazy()` для i18n
- Тесты: pytest + factory_boy

### Frontend — Next.js
- **TypeScript strict** — никаких `any`
- Серверные компоненты по умолчанию, `'use client'` только для интерактивности
- API через `src/lib/api.ts` с JWT interceptors
- Формы: `react-hook-form` + `zod`
- State: **Zustand**
- Стили: **только Tailwind + DaisyUI**, никаких CSS файлов
- Иконки UI: **Lucide React** (`lucide-react`), никаких других библиотек
- Иконки тематические: кастомные SVG в `public/icons/auto/` и `components/icons/` (outline, stroke-width 2, 24x24)
- SEO: `generateMetadata()` в серверных компонентах

### Git
- Ветки: `main` (прод), `develop` (разработка), `feature/*`, `fix/*`, `hotfix/*`
- Conventional commits: `feat:`, `fix:`, `chore:`, `docs:`
- PR: feature → develop → main

---

## SEO
- Уникальный `<title>`, `<meta description>`, Open Graph на публичных страницах
- JSON-LD: Organization, Course, Article, FAQ, BreadcrumbList
- `sitemap.xml` (next-sitemap), `robots.txt` (закрыть /dashboard, /admin, /api, /auth)
- `<link rel="canonical">`, семантическая разметка, `alt` на изображениях
- Core Web Vitals: LCP <2.5s, FID <100ms, CLS <0.1

---

## Фазы разработки

1. **Фундамент** — Docker, Django, Next.js, JWT auth, users, layout, CI
2. **Контент и видео** — courses, video, HLS, S3, CDN, плеер, прогресс
3. **Тестирование** — тесты ПДД, билеты, экзамен, статистика, импорт
4. **Оплата** — LiqPay/Monobank, тарифы, промокоды, подписки, webhooks
5. **Расписание и чат** — слоты, бронирование, Zoom/Meet, WebSocket чат
6. **Разборы и блог** — ситуации, комментарии, статьи, SEO
7. **Уведомления и защита** — email, push, лимит сессий, детекция аномалий
8. **Админка и кабинеты** — преподаватель, админ-панель, дашборды
9. **PWA, i18n, полировка** — manifest, service worker, тесты, оптимизация
