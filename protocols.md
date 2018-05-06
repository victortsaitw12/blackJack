# Game Protocols

{% hint style="info" %}
All protocols have attributes, proto, to identify.
{% endhint %}

{% hint style="info" %}
The protocols which is from the other process would have attributes, from\_topic, to identify the source process.
{% endhint %}

## PLAYER\_PL

```text
user_id: int
nickname: string
money_in_pocket: int
money_in_table: int
seat_id: int
```

## PLAYER\_SCORE\_PL

```text
user_id: int
money_in_table: int
seat_id: int
win_money: int
hand: array of objects (HAND_PL)
```

## HAND\_PL

```text
hand_id: int
seat_id: int
cards: array of string(['AS', '3H', ....])
soft_point: int
hard_point: int
blackJack: boolean
isPair: boolean
parent_id: int
option: string('hit'/'stand'/'double'/'split'/giveup')
```

## WIN\_PL

```text
hand_id: int
bet_money: int
win_money: int
```

## BLJ2DBA\_REQ\_CONFIG

```text
seq: sequence
area: string
```

## DBA2BLJ\_RSP\_CONFIG

```text
seq_back: sequence
config: object
```

## GCT2BLJ\_REQ\_JOIN\_TABLE

> 1. Filter out the tables that do not have seats.
> 2. Find the table that has least empty seats.
> 3. Create a table if there is no tables to sit.

```text
seq: sequence
area: string
user_id: int
```

## BLJ2DBA\_REQ\_JOIN\_TABLE

> 1. DBA finds the user information in MemberDB.
> 2. If not, DBA returns 'FALSE' result to server.
> 3. DBA finds if there is remaining money in collection, MoneyInTable.
> 4. DBA returns 'SUCCESS' to server.

```text
seq: sequence
area: string
table_id: int
user_id: int
```

## DBA2BLJ\_RSP\_JOIN\_TBALE

```text
seq_back: sequence
area: string
table_id: int
user_id: int
money_in_pocker: int
money_in_table: int
nickname: string
result: string
```

## BLJ2GCT\_RSP\_JOIN\_TABLE

> 1. If DBA responds 'FALSE', sever returns 'FALSE' result to client too.
> 2. Server returns 'SUCCESS'.

```text
seq_back: sequence
player: player object(PLAYER_PL)
area: string
table_id: int
result: string
```

## GCT2BLJ\_REQ\_TABLE\_INFO

> 1. If server can not find the table by table id, server returns 'FALSE'.

```text
seq: sequence
area: string
table_id: int
```

## BLJ2GCT\_RSP\_TABLE\_INFO

```text
seq_back: sequence
table_id: int
sit: array of objects (PLAYER_PL)
stand: array of objects (PLAYER_PL)
result: string
```

## GCT2BLJ\_REQ\_BUY\_IN

> 1. If server can not find the table by table id, server returns 'FALSE'.
> 2. If server can not find the user in the table, server returns 'FALSE'.
> 3. server asks DBA to buy in.

```text
seq: sequence
area: string
table_id: int
user_id: int
buy_in: int
```

## BLJ2DBA\_REQ\_BUY\_IN

> 1. If DBA can not find the user in the MemberDB, DBA returns 'FALSE'.
> 2. If the user's money is less than buy\_in, DBA returns 'FALSE'.
> 3. DBA deducts user's money in the MemberDB and adds the money to the BLJMoneyInTable.
> 4. DBA returns the money in the BLJMoneyInTable and MemberDB to the server.

```text
seq: sequence
area: string
table_id: int
user_id: int
buy_in: int
```

## DBA2BLJ\_RSP\_BUY\_IN

```text
seq_back: sequence
area: string
table_id: int
user_id: int
money_in_pocket: int
money_in_table: int
result: string
```

## BLJ2GCT\_RSP\_BUY\_IN

> 1. If DBA returns 'FALSE', server returns the 'FALSE' to client.
> 2. The server stores the moeny to user.

```text
seq_back: sequence
area: string
table_id: int
user_id: int
money_in_pocket: int
money_in_table: int
result: string
```

## GCT2BLJ\_REQ\_SIT\_DOWN

> 1. If user's money in table is less than the config setting, sit\_down\_money, server returns 'FALSE'.
> 2. If the seat has been occupied, server returns 'FALSE'.

```text
seq: sequence
area: string
table_id: int
user_id: int
seat_id: int
```

## BLJ2GCT\_RSP\_SIT\_DOWN

```text
seq_back: sequence
result: string
```

## GCT2BLJ\_REQ\_BET

> 1. If server cannot find the table by the table id, server returns 'FALSE'.
> 2. If server cannot find the user in the table and is sitting, server returns 'FALSE'.
> 3. If the bet is less than the minium bet, server returns 'FALSE'.
> 4. If user's money in table is less than the bet, server returns 'FALSE'.
> 5. Server deducts user's money in table and record on the betting list.

```text
seq: sequence
area: string
table_id: int
user_id: int
bets: object ({seat_id: 1, bet: 1000})
pair_bets: objects ({seat_id: 1, bet: 1000})
```

## BLJ2GCT\_RSP\_BET

> bets & pair\_bets are real betting result.

```text
seq_back: sequence
bets: object({seat_id: 1, bet: 1000})
pair_bets: object({seat_id: 1, bet: 1000})
result: string
```

## GCT2BLJ\_NTF\_BET

```text
area: string
table_id: int
user_id: int
bets: array of objects([{seat_id: 1, bet: 1000}, {seat_id: 3, bet: 2000}..])
pair_bets: array of objects([{seat_id: 1, bet: 1000}, {seat_id: 3, bet: 2000}..])
```

## BLJ2GCT\_NTF\_DEAL\_CARD

```text
area: string
table_id: int
user_id: int
seat_id: int
hand: object(HAND_PL)
```

## BLJ2GCT\_NTF\_YOUR\_TURN\_TO\_PLAY

```text
area: string
table_id: int
seat_id: int
hand_id: int
options: array of string(['hit', 'stand', 'double', 'split', 'giveup'])
```

## GCT2BLJ\_REQ\_PLAY

> 1. If server cannot find the table by the table id, server returns 'FALSE'.
> 2. If server cannot find the user in the table, server returns 'FALSE'.
> 3. If this round is not for this user, server returns 'FALSE'.
> 4. If user clicks double or split, but the user's money in the table is not enough, server returns 'stand' instead.

```text
area: string
table_id: int
user_id: int
seat_id: int
hand_id: int
option: string ('hit'/'stand'/'double'/'split'/giveup')
```

## BLJ2GCT\_RSP\_PLAY

> Server return the real option.

```text
seq_back: sequence
area: string
table_id: int
seat_id: int
hand_id: int
option: string ('hit'/'stand'/'double'/'split'/giveup')
result: string
```

## BLJ2GCT\_NTF\_OTHER\_PLAY

```text
area: string
table_id: int
user_id: int
seat_id: int
hand_id: int
option: string ('hit'/'stand'/'double'/'split'/giveup')
```

## BLJ2GCT\_NTF\_DEALER\_CARDS

```text
area: string
table_id: int
hand: object (HAND_PL)
```

## BLJ2GCT\_NTF\_SHOWDOWN

```text
area: string
table_id: int
hands: array of objects (HAND_PL)
dealer_hand: object (HAND_PL)
refunds: array of object (WIN_PL)
```

## BLJ2DBA\_REQ\_WRITE\_SCORE

```text
seq: sequence
area: string
table_id: int
dealer_hand: object (HAND_PL)
player_scores: array of objects (PLAYER_SCORE_PL)
```

## DBA2BLJ\_RSP\_WRITE\_SCORE

```text
seq_back: sequence
result: string
```

