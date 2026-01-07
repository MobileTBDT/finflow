# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app

# Vì Dockerfile nằm trong /backend, ta copy file tại chỗ
COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Run
FROM node:18-alpine
WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# Render sẽ dùng biến môi trường PORT, nhưng ta cứ EXPOSE để minh họa
EXPOSE 3000

CMD ["node", "dist/main"]