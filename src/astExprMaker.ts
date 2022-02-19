
/*
    Provides a super easy mechanism to create AST expressions
    on the fly within code

    Example usage:

        `let expr = implies(and("a", "b"), "c");`

    which would represent

        `a and b implies c`
    
    or in internal representation

        {
            type: AstExprKind.Implies,
            a: {
                type: AstExprKind.And,
                a: { type: AstExprKind.Symbol, name: "a" },
                b: { type: AstExprKind.Symbol, name: "b" },
            },
            b: { type: AstExprKind.Symbol, name: "c" }
        }
*/

import { AstBinaryExpr, AstExpr, AstExprKind, Flavor } from './ast';

export function symbol(name: string): AstExpr {
    return { type: AstExprKind.Symbol, name };
}

export function not(child: AstExpr | string): AstExpr {
    return { type: AstExprKind.Not, child: autoSymbol(child) };
}

export function and(a: AstExpr | string, b: AstExpr | string): AstExpr {
    return { type: AstExprKind.And, a: autoSymbol(a), b: autoSymbol(b), flavor: Flavor.Naked };
}

export function or(a: AstExpr | string, b: AstExpr | string): AstExpr {
    return { type: AstExprKind.Or, a: autoSymbol(a), b: autoSymbol(b), flavor: Flavor.Naked };
}

export function implies(a: AstExpr | string, b: AstExpr | string): AstExpr {
    return { type: AstExprKind.Implies, a: autoSymbol(a), b: autoSymbol(b), flavor: Flavor.Naked };
}

export function binaryExpr(type: AstExprKind.And | AstExprKind.Or | AstExprKind.Implies, a: AstExpr | string, b: AstExpr | string, flavor: Flavor): AstExpr {
    return { type, a: autoSymbol(a), b: autoSymbol(b), flavor };
}

export function reducedImplies(a: AstExpr | string, b: AstExpr | string): AstExpr {
    let expr: AstBinaryExpr = or(not(a), b) as AstBinaryExpr;
    expr.flavor = Flavor.Implies;
    return expr;
}

export function any(...args: (AstExpr | string)[]): AstExpr {
    return { type: AstExprKind.Any, children: args.map(autoSymbol) };
}

export function all(...args: (AstExpr | string)[]): AstExpr {
    return { type: AstExprKind.All, children: args.map(autoSymbol) };
}

export function selectExpr(type: AstExprKind.Any | AstExprKind.All, ...args: (AstExpr | string)[]): AstExpr {
    return { type, children: args.map(autoSymbol) };
}

export function tautology(): AstExpr {
    return { type: AstExprKind.Tautology };
}

export function contradiction(): AstExpr {
    return { type: AstExprKind.Contradiction };
}

export function assertion(type: AstExprKind.Tautology | AstExprKind.Contradiction): AstExpr {
    return { type };
}

export function makeConjunction(children: AstExpr[]): AstExpr {
    if (children.length <= 0) throw new Error("makeConjunction() got no children to make conjunction with");

    if (children.length == 1) return children[0];

    if (children.length == 2) return and(children[0], children[1]);

    return all(...children);
}

export function makeDisjunction(children: AstExpr[]): AstExpr {
    if (children.length <= 0) throw new Error("makeDisjunction() got no children to make disjunction with");

    if (children.length == 1) return children[0];

    if (children.length == 2) return or(children[0], children[1]);

    return any(...children);
}

function autoSymbol(expr: AstExpr | string): AstExpr {
    return typeof expr == "string" ? symbol(expr) : expr;
}
