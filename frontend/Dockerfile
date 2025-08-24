FROM node:20.11.1-bullseye-slim AS builder
ARG VITE_BACKEND_URL
#ENV NODE_ENV=production
WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:18.17.0-bullseye-slim AS release
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 8080