
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

import { AstExpr, AstExprKind } from './ast';

export function symbol(name: string): AstExpr {
    return { type: AstExprKind.Symbol, name };
}

export function not(child: AstExpr | string): AstExpr {
    return { type: AstExprKind.Not, child: autoSymbol(child) };
}

export function and(a: AstExpr | string, b: AstExpr | string): AstExpr {
    return { type: AstExprKind.And, a: autoSymbol(a), b: autoSymbol(b) };
}

export function or(a: AstExpr | string, b: AstExpr | string): AstExpr {
    return { type: AstExprKind.Or, a: autoSymbol(a), b: autoSymbol(b) };
}

export function implies(a: AstExpr | string, b: AstExpr | string): AstExpr {
    return { type: AstExprKind.Implies, a: autoSymbol(a), b: autoSymbol(b) };
}

export function any(...args: (AstExpr | string)[]): AstExpr {
    return { type: AstExprKind.Any, children: args.map(autoSymbol) };
}

export function all(...args: (AstExpr | string)[]): AstExpr {
    return { type: AstExprKind.All, children: args.map(autoSymbol) };
}

function autoSymbol(expr: AstExpr | string): AstExpr {
    return typeof expr == "string" ? symbol(expr) : expr;
}
