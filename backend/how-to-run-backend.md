# Cách chạy backend:

## Lần đầu:

Bước 1:
`copy .env.example .env`

Mở .env và điền các giá trị

Bước 2:
`docker compose up -d --build`

Bước 3 (optional):
`docker compose ps`
`docker compose logs -f db`
`docker compose logs -f backend`

## Mấy lần sau:

`docker compose up -d`
