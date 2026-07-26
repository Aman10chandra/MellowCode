# Dockerfile for MellowCode Backend (Railway)
FROM python:3.11-slim
WORKDIR /app

# Install dependencies
COPY pyproject.toml uv.lock ./
RUN pip install --no-cache-dir uv && uv pip install --system -r pyproject.toml

# Copy backend code
COPY server.py ./
COPY agent/ ./agent/

EXPOSE 8000

CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port $PORT"]
