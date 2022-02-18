# OkayProve
Logical proof generator written in TypeScript



### Example Usage

Prompt: (conclusion is last line)

```
(q and (a or b)) or ((b or a) and r)
b or a
```

Proof:

```
(q and (a or b)) or ((b or a) and r) [premise]
 (q and (a or b)) or ((a or b) and r) [commutative]
  ((a or b) and q) or ((a or b) and r) [commutative]
   (a or b) and (q or r) [distributive]
    a or b [specialization]
     b or a [commutative]
```

