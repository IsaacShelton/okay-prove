# okay-prove
Propositional logic proof generator written in TypeScript



### CLI Usage

```
okay-prove <file> <options>
```



#### Options

```
-h, -help              help
-V, --version          version
-t, --trace            show known facts if unable to prove
-f, --format <choice>  format for proof - cascade, inline, latex, or collapse
```



#### Example

````
okay-prove proof18.logic -f latex
````



### Prompt Format

question1.logic

```
a
b
a and b
```

The last line is the conclusion. Every other line is a premise.

##### Symbols

Symbols can be any combination of the characters `A-Z`, `a-z`, `0-9` and `_`.

##### Operators

Operators include `and`, `or`, `not` and `implies`, with `not` having the highest precedence and `implies` having a lower precedence than `and` and `or`.

##### Groups

Expressions can be grouped together by parentheses - e.g. `(a implies b) and (b and c)`

##### Tautologies

Tautologies are written with a period - e.g. `.`

##### Contradictions

Contradictions are written with an exclaimation point - e.g. `!`



### Example Proofs

#### Example #1

Prompt:

```
(q and (a or b)) or ((b or a) and r)
b or a
```

Proof:

```
 1. (q and (a or b)) or ((b or a) and r) [premise]
 2. (q and (a or b)) or ((a or b) and r) [commutative : 1]
 3. ((a or b) and q) or ((a or b) and r) [commutative : 2]
 4. (a or b) and (q or r)                [distributive : 3]
 5. a or b                               [specialization : 4]
 6. b or a                               [commutative : 5] ☐
```



#### Example #2

Prompt:

```
p or not (r or q)
s implies r
not p
not s
```

Proof:

```
 1. not p             [premise]
 2. p or not (r or q) [premise]
 3. not (r or q)      [elimination : 2, 1]
 4. not r and not q   [de morgan's : 3]
 5. not r             [specialization : 4]
 6. s implies r       [premise]
 7. not s             [modus tollens : 6, 5] ☐
```



#### Example #3

Prompt:

```
p implies (q implies r)
not ((q implies r) and s)
not (p and s) implies u and w
x implies not u
s
not x
```

Proof:

```
 1. s                               [premise]
 2. not ((q implies r) and s)       [premise]
 3. not ((not q or r) and s)        [definition of implies : 2]
 4. not (not q or r) or not s       [de morgan's : 3]
 5. not (not q or r)                [elimination : 4, 1]
 6. p implies (q implies r)         [premise]
 7. p implies (not q or r)          [definition of implies : 6]
 8. not p                           [modus tollens : 7, 5]
 9. not p or not s                  [generalization : 8]
10. not (p and s)                   [de morgan's : 9]
11. not (p and s) implies (u and w) [premise]
12. u and w                         [modus ponens : 11, 10]
13. u                               [specialization : 12]
14. x implies not u                 [premise]
15. not x                           [modus tollens : 14, 13] ☐
```

