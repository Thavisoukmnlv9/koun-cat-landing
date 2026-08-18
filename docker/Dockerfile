FROM node:26-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm i -g npm@11.6.0
RUN npm ci

COPY . .

RUN npm run build

# Runtime
FROM node:26-alpine

WORKDIR /app

RUN npm install -g serve

COPY --from=build /app/dist ./dist

EXPOSE 80

CMD ["serve", "-s", "dist", "-l", "80"]
