FROM node:16.18.1 AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build


FROM node:16.18.1

ENV NODE_ENV production

WORKDIR /app

COPY ./resources/db.sqlite ./resources/
COPY package*.json ./

RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD [ "node", "dist/index.js" ]
