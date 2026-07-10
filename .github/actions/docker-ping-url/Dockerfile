FROM python:alpine3.19

RUN pip install uv

WORKDIR /app

COPY pyproject.toml uv.lock ./

RUN python -V

RUN uv sync --frozen

COPY . .

CMD ["python","main.py"]

