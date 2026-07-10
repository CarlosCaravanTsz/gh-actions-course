FROM python:alpine3.19

RUN pip install uv

WORKDIR /app

COPY pyproject.toml uv.lock ./

RUN python -V

ENV UV_PROJECT_DIR=/app
ENV PATH=/app/.venv/bin:$PATH

RUN uv sync --frozen

COPY . .

CMD ["python", "/app/main.py"]

