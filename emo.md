# Ｍemo

## Third Party APIs

| **Module** | **Facility** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Awilix | DI \(Dependecy Injection\) |
| Joi | Protocol validation |
| kafka-node | Kafka connector |
| ioredis | Redis connector |
| Mocha | Unit testing framework |
| Chai | Assertion library |
| sinon | Spies, stubs and mocks |
| nodemon | reload the process in the container |



## Clear unused docker images and containers

```bash
docker rmi $(docker images -q -f "dangling=true")
docker rm $(docker ps -q -f status=exited)
docker system prune
docker volume prune
```

## Upload NPM Package

{% hint style="info" %}
The version in the package.json must greater than the original one. 
{% endhint %}

```bash
npm login
npm whami
vim package.js
npm publish
```

## Kafka-node: Could not not found the leader

> Call client.refreshMetadata\(\) before sending the first message.

> ```javascript
> // Refresh metadata required for the first message to go through
> client.refreshMetadata([topic], (err) => {
>   if (err) {
>     console.warn(`Error:${err}`);
>   }
> })
> ```

## Auto reload NodeJS process in the container

{% hint style="info" %}
Install nodemon when building the image with Dockerfile.

Mount the codebase to the executing directory in the container and ask nodemon to watch any change of the code.
{% endhint %}

> {% embed data="{\"url\":\"https://medium.com/lucjuggery/docker-in-development-with-nodemon-d500366e74df\",\"type\":\"link\",\"title\":\"Docker in Development With Nodemon\",\"description\":\"TL;DR\",\"icon\":{\"type\":\"icon\",\"url\":\"https://cdn-images-1.medium.com/fit/c/304/304/1\*SJryNEZi8mugN4guNayofw.png\",\"width\":152,\"height\":152,\"aspectRatio\":1},\"thumbnail\":{\"type\":\"thumbnail\",\"url\":\"https://cdn-images-1.medium.com/max/1200/0\*LaLpavOVZGWNiLI\_.\",\"width\":1024,\"height\":768,\"aspectRatio\":0.75}}" %}

{% code-tabs %}
{% code-tabs-item title="Dockerfile" %}
```text
FROM node
RUN madir -p /app
WORKDIR /app

RUN npm install -g nodemon
COPY package.json /app/
RUN npm install
COPY . /app
CMD ["node", "index.js"]
```
{% endcode-tabs-item %}
{% endcode-tabs %}

{% code-tabs %}
{% code-tabs-item title="docker-compose.yml" %}
```yaml
version: "3"

services:
  dba:
    build: ./dba
    command: nodemon index.js
    volumes:
      -./dba:/app

```
{% endcode-tabs-item %}
{% endcode-tabs %}

## Map the nginx.conf into the nginx container

```text
nginx:
  build: ./nginx
  ports:
    - "8080:80"
    - "9080:9080"
  volumes
    - "./nginx/nginx.conf:/etc/nginx/nginx.conf"
  depends_on
    - web1
    - web2
    - gwy
```

