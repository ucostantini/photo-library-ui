FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

RUN npm build

COPY . .

EXPOSE 3000
CMD [ "node", "index.js" ]
