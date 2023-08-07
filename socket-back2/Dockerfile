FROM node:16.14-alpine

RUN mkdir -p /app
WORKDIR /app

COPY ./ /app

RUN npm install

EXPOSE 4000

CMD ["npm", "start"]