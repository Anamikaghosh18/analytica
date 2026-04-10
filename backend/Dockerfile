# Stage 1: Build stage
FROM python:3.11-slim AS builder

WORKDIR /build

# Install system build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Create a virtual environment to keep things clean
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Stage 2: Final stage
FROM python:3.11-slim

WORKDIR /app

# Copy the virtual environment from the builder
COPY --from=builder /opt/venv /opt/venv

# Ensure we use the virtual environment
ENV PATH="/opt/venv/bin:$PATH"
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install runtime-only dependencies (libpq is needed for psycopg2 to talk to Postgres)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy the application code
COPY . .

# Expose port
EXPOSE 8000

# Run uvicorn using the venv
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
