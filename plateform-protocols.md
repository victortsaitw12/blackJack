# Plateform Protocols

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

