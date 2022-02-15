
import { removeImplies } from './simplify';
import { parseForTesting } from './testing';
import { Ast, AstExprKind } from './ast';

test("empty test", () => { });

test("remove implies example 1", () => {
    let ast = parseForTesting("a implies b");

    if (!(ast instanceof Ast)) {
        fail();
    }

    let unsimplifiedExpr = ast.conclusion;
    let simplifiedExpr = removeImplies(unsimplifiedExpr);

    expect(simplifiedExpr).toEqual({
        type: AstExprKind.Or,
        a: {
            type: AstExprKind.Not,
            child: { type: AstExprKind.Symbol, name: "a" },
        },
        b: {
            type: AstExprKind.Symbol,
            name: "b",
        }
    });
});
