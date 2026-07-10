FROM python:alpine3.19

RUN pip install uv

WORKDIR /app

COPY pyproject.toml uv.lock ./

RUN python -V

# Agrega primero la ruta de la venv del dir para que se resuelva al interprete del venv
ENV PATH=/app/.venv/bin:$PATH

RUN uv sync --frozen

COPY . .

CMD ["python", "/app/main.py"]

