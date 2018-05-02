FROM node:carbon
RUN mkdir /app
WORKDIR /app

RUN npm install -g nodemon
COPY package.json /app/package.json
RUN npm install
COPY . /app
ENV MESSAGE="HELLO BY VICTOR"
CMD ["npm", "start"]
