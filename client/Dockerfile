FROM node:16-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm i -g @angular/cli

RUN npm install --legacy-peer-deps

COPY . .

RUN ng build --prod

# Serve Application using Nginx Server

FROM nginx:alpine

EXPOSE 80
COPY nginx.conf /etc/nginx/nginx.conf.d/
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist/* /usr/share/nginx/html/
CMD ["nginx", "-g", "daemon off;"]
