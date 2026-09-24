FROM node:22-alpine

WORKDIR /app

RUN npm install -g npm@11

COPY package*.json ./

RUN npm install --omit=dev

COPY . .

EXPOSE 5000

CMD ["npm", "start"]