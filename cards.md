# Game API

## Card

constructor

```text
input: string
```

isA

> getter

```text
output: boolean
```

figure

> getter

```text
output: string ('A', '1',...,'K')
```

point

> getter

```text
output: number (11, 1, 2, ..., 10)
```

hardPoint

> getter

```text
output: number (1, 2, 3, ...., 10)
```

## Hand

constructor

```text
input: array of string (['AS', '3H']..)
```

softPoint

> getter

```text
output: number (12, 19, 21 ...)
```

hardPoint

> getter

```text
output: number (12, 19, 21 ...)
```

cards

> getter

```text
output: array of card object
```

blackJack

> getter

```text
output: boolean
```

isPair

> getter

```text
output: boolean
```

push

> method

```text
input: card object
output: array of card objects
```

## Deck

constructor

```text
input: number
```

deal

> method

```text
output: card object
```

cards

> getter

```text
output: array of card objects
```

push

> method

```text
input: card object
output: array of card object
```



