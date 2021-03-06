FROM node:latest
WORKDIR /usr/src/sdc-atelier-product
COPY package.json ./
RUN npm install
RUN npm install forever -g
ARG DB_HOST
ARG DB_USER
ARG DB_PASS
RUN bash intialize_db.sh DB_HOST DB_USER DB_PASS
COPY . .
EXPOSE 5000
CMD ["forever start", "server/index.js"]
