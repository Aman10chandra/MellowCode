# Multi-stage Dockerfile for MellowCode (Backend + Frontend)
FROM node:20-slim AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM python:3.11-slim
WORKDIR /app

# Install dependencies
COPY pyproject.toml ./
RUN pip install --no-cache-dir uv && uv pip install --system -r pyproject.toml

# Copy backend code
COPY server.py ./
COPY agent/ ./agent/

# Copy built frontend output for serving if needed
COPY --from=frontend-builder /app/frontend/.output ./frontend/.output

EXPOSE 8000

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
