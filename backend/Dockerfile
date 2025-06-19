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

# CMD para desarrollo: migrate y runserver. En producción lo cambiarás a Gunicorn.
CMD bash -c "python manage.py migrate --noinput && python manage.py runserver 0.0.0.0:8000"
