
import { areExprsIdentical, Ast, AstExpr } from './ast';
import { breakDown } from './breakDown';
import { canConclude } from './canConclude';
import { deduce } from './deduce';
import { byPremise } from './justification';
import { initialSimplify } from './simplify';
import { simplifyConclusion } from './simplifyConclusion';
import { Waterfall } from './waterfall';

export class Structure {
    facts: AstExpr[];
    conclusion: Waterfall;

    constructor(ast: Ast) {
        this.facts = ast.premises.map(byPremise).map(initialSimplify);
        this.conclusion = simplifyConclusion(ast.conclusion);
    }

    step(): AstExpr | 'progress' | 'stagnant' {
        let oldFactsLength = this.facts.length;

        // Work forward by breaking down known facts
        this.facts = breakDown(this.facts);

        // Work forward by deducing from known facts
        this.facts = deduce(this.facts);

        // Try to reach the conclusion given the facts we know
        let solution = this.conclusionReached();

        if (solution) {
            return solution;
        } else if (this.facts.length != oldFactsLength) {
            return 'progress';
        } else {
            return 'stagnant';
        }
    }

    conclusionReached(): AstExpr | null {
        let couldConclude = canConclude(this.facts, this.conclusion.getLatest());

        if (couldConclude) {
            return this.conclusion.unwind(couldConclude);
        } else {
            return null;
        }
    }

    hasFact(expr: AstExpr): boolean {
        for (let fact of this.facts) {
            if (areExprsIdentical(expr, fact)) {
                return true;
            }
        }
        return false;
    }
}

export function okayProve(ast: Ast): AstExpr | null {
    let structure = new Structure(ast);

    while (true) {
        let result = structure.step();

        switch (result) {
            case 'progress':
                continue;
            case 'stagnant':
                return null;
            default:
                return result;
        }
    }
}
