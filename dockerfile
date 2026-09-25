FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

ENV DATABASE_URL="file:./dev.db"

RUN npx prisma generate

EXPOSE 3001