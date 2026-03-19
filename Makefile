up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

logs-backend:
	docker compose logs -f backend

logs-frontend:
	docker compose logs -f frontend

migrate:
	docker compose exec backend python manage.py migrate

makemigrations:
	docker compose exec backend python manage.py makemigrations

createsuperuser:
	docker compose exec backend python manage.py createsuperuser

shell:
	docker compose exec backend python manage.py shell

test:
	docker compose exec backend pytest -v

collectstatic:
	docker compose exec backend python manage.py collectstatic --noinput

restart:
	docker compose restart

restart-backend:
	docker compose restart backend celery_worker celery_beat

ps:
	docker compose ps
