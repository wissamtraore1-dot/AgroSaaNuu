test:
	python manage.py test apps --settings=core.settings.development -v 2

deploy-check:
	python manage.py check --deploy --settings=core.settings.production

collectstatic:
	python manage.py collectstatic --no-input --settings=core.settings.production

gunicorn:
	gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 4 --timeout 120