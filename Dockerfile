# Usar una imagen oficial de Python como base
FROM python:3.12-slim

# Evitar que Python genere archivos .pyc y asegurar que los prints salgan sin buffer
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Establecer el directorio de trabajo dentro de la caja (contenedor)
WORKDIR /app

# Instalar dependencias del sistema para PostgreSQL y OCR (Tesseract/Poppler)
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    tesseract-ocr \
    tesseract-ocr-spa \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# Copiar la lista de requisitos e instalarlos
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo el código del proyecto a la caja
COPY . .