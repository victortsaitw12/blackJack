# MongoDB Schemas

## MemberDB

| **Column Name** | **Type** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| \_id | \_id |
| user\_id | int |
| nickname | string |
| money | int |
| exp | int |
| level | int |
| created\_dt | Datetime |
| updated\_dt | Datetime |

## BLJGameRecord

| **Column Name** | **Type** |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| \_id | \_id |
| area | string |
| table\_id | int |
| dealer | string |
| first\_user | string |
| second\_user | string |
| third\_user | string |
| fourth\_user | string |
| fifth\_user | string |
| created\_dt | datetime |

## BLJMoneyInTable

| **Column Name** | **Type** |
| --- | --- | --- | --- | --- | --- | --- |
| \_id | \_id |
| user\_id | int |
| area | string |
| table\_id | int |
| money | int |
| updated\_dt | datetime |

## BLJConfig

| **Column Name** | **Type** |
| --- | --- | --- | --- | --- | --- | --- |
| \_id | \_id |
| area | string |
| min\_bet | int |
| min\_pair\_bet | int |
| sit\_down\_money | int |
|  |  |





