FROM node:carbon
RUN mkdir -p /app
WORKDIR /app

RUN npm install -g nodemon
COPY . /app
RUN npm install
CMD ["npm", "start"]
