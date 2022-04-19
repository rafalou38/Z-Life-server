

# unity send:


- [x] Connect

```json
{
    "type": "init",
    "userID": "",
}
// returns ->
{
    "message":"connected"
}
```

- [x] Change Chunk

```json

{
    "type": "event",
    "details": {
        "type": "chunk",
        "code": "",
        "position": {
            "x": 0,
            "y": 0
        }
    }
}

```

## Move

```json

{
    "type": "event",
    "details": {
        "type": "move",
        "position": {
            "x": 0,
            "y": 0
        }
    }
}

```

# unity receive

## Player moved

```json
{
    "type": "event",
    "details": {
        "type": "move",
        "user": {
            "id": "",
            "position": {
                "x": 0,
                "y": 0
            }
        },
    }
}
```

## Player left chunk
```json
{
    "type": "event",
    "details": {
        "type": "player left",
        "user": {
            "id": "",
        },
    }
}
```