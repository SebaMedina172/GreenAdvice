FROM python:3.11-slim

# Instala dependencias para Postgres
RUN apt-get update && \
    apt-get install -y build-essential libpq-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copia requirements e instala
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia el resto del código
COPY . .

# Expone el puerto 8000
EXPOSE 8000

# Comando para producción: migrate y gunicorn con más configuraciones
CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py collectstatic --noinput && python manage.py createsuperuser --noinput --username $DJANGO_SUPERUSER_USERNAME --email $DJANGO_SUPERUSER_EMAIL || true && gunicorn greendadvice_backend.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 2 --timeout 120"]