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

# Comando simple para producción
CMD ["sh", "-c", "python manage.py migrate && python manage.py collectstatic --noinput && gunicorn greenadvice_backend.wsgi:application --bind 0.0.0.0:8000"]