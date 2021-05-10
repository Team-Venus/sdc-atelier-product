FROM node:latest
WORKDIR /usr/src/sdc-atelier-product
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["node", "server/index.js"]