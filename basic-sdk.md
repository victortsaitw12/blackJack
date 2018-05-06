# Basic SDK

{% hint style="info" %}
npm install victsaitw-sdk --save
{% endhint %}

## SDK

```text
redis
protocol
mongo
kafka
```

start

> method

```text
input object ({schemas: joi object, mongo_url, kafka_url})
```

send2XYZ

> method

```text
input: object (payload instance)
output: promise (resolve: {req, rsp})
```

kafkaMessage

> event

```text
output: object
```

stateChange

> event

```text
output: string (state)
```

sequence

> getter
>
> ```text
> output: number (sequence)
> ```

## Timeout

registerTimeout

## Protocol

```text
schemas
```

validate

> method

```text
input: object
output: object (payload instance)
```

makeEmptyProtocol

> method

```text
input: string (protocol name)
output: object (payload instance)
```

## Payload

> ```text
> content
> _to_topic
> _timeout
> ```

update

> method

```text
input: object
ouptu: object (payload instance)
```

find

> method

```text
input: string (key)
ouput: object (value
```

toObject

> method

```text
output: object
```

toString

> method

```text
output: string
```

seq

> getter

```text
output: int
```

fromTopic

> getter

```text
output: string
```

proto

> getter

```text
output: string
```

toTopic

> getter

```text
output: string
```

toTopic

> setter

```text
input: string
```

timeout

> getter

```text
output: int (ms)
```

timeout

> setter

```text
input: int (seconds)
```

## Mongo

## Kafka

send2XYZ

> method

```text
input: object ({topic: string, protocol: object})
```

kafkaMessage

> event

```text
output: object({from_topic, protocol: object})
```

stateChange

> event

```text
output: string (state)
```

## Redis



