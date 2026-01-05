FROM node:20-bullseye-slim

RUN apt-get update && apt-get install -y netcat && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package.json package-lock.json* ./
RUN npm ci --production=false

COPY . .

RUN chmod +x ./wait-for-db.sh

RUN npm run build

EXPOSE 3000

ENTRYPOINT ["./wait-for-db.sh"]
CMD ["npm", "run", "start:dev"]