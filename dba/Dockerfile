FROM node:carbon
RUN mkdir -p /app
WORKDIR /app

RUN npm install -g nodemon
COPY . /app
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]
