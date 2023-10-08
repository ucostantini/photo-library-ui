FROM alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

RUN npm build

RUN apk --update-cache add sqlite \
&& rm -rf /var/cache/apk/* \
&& sqlite3 -batch ./db.sqlite < ./resources/tables.sql \
&& chmod a+rw ./db.sqlite

EXPOSE 3000
CMD [ "node", "index.js" ]
