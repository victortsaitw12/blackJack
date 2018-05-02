FROM node:carbon
RUN mkdir /app
WORKDIR /app

RUN npm install -g nodemon
COPY . /app
RUN npm install
ENV MESSAGE="HELLO BY VICTOR"
CMD ["npm", "start"]
