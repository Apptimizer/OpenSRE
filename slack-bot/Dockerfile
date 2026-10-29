FROM python:3.11-slim
WORKDIR /app
COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv
COPY pyproject.toml uv.lock* ./
RUN uv sync --frozen --no-dev || uv sync --no-dev
COPY . .
RUN chown -R 1000:1000 /app
USER 1000
EXPOSE 3000
CMD ["/app/.venv/bin/python", "app.py"]
