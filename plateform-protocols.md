# Gateway Protocols

## GCT2GWY\_REQ\_BIND\_USER

```text
seq: sequence
clinet_id: int
user_id: int
```

## GWY2GCT\_RSP\_BIND\_USER

```text
seq_back: sequence
result: string
```

## GCT2GWY\_REQ\_GAME\_PLAY

```text
seq: sequence
client_id: int
to_topic: string
payload: object
```

## GWY2SVR\_REQ\_GAME\_PLAY

{% hint style="info" %}
payload.seq = seq
{% endhint %}

```text
seq: sequence
payload: object
```

## SVR2GWY\_RSP\_GAME\_PLAY

```text
seq_back: sequence
payload object
```

## GWY2GCT\_RSP\_GAME\_PLAY

```text
seq_back: sequence
payload: object
```

## SVR2GWY\_NTF\_GAME\_PLAY

```text
user_id: int
payload: object
```

## GWY2GCT\_NTF\_GAME\_PLAY

```text
payload: object
```



