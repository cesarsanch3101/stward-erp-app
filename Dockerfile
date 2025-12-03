# Usar una imagen oficial de Python como base
FROM python:3.12-slim

# Evitar que Python genere archivos .pyc y asegurar que los prints salgan sin buffer
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Establecer el directorio de trabajo dentro de la caja (contenedor)
WORKDIR /app

# Copiar la lista de requisitos
COPY requirements.txt .

# Instalar los requisitos
RUN pip install --no-cache-dir -r requirements.txt

# Copiar todo el código del proyecto a la caja
COPY . .