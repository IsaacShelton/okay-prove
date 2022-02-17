
import unimplemented from 'ts-unimplemented';
import { areExprsIdentical, Ast, AstExpr } from './ast';
import { breakDown } from './breakDown';
import { deduce } from './deduce';
import { byPremise } from './justification';
import { simplifyConclusion } from './simplifyConclusion';

export class Structure {
    facts: AstExpr[];
    conclusion: AstExpr;

    constructor(ast: Ast) {
        this.facts = ast.premises.map(byPremise);
        this.conclusion = simplifyConclusion(ast.conclusion);
    }

    step(): AstExpr | 'progress' | 'stagnant' {
        let oldFactsLength = this.facts.length;

        // Work forward by breaking down known facts
        this.facts = breakDown(this.facts);

        // Work forward by deducing from known facts
        this.facts = deduce(this.facts);

        /*
        // Work forward by deducing from known facts
        {
            let newFacts = deduce(this.facts);

            if (newFacts.length !== 0) {
                this.facts = this.facts.concat(newFacts);
                result = Result.Progress;
            }
        }

        // Work backwards by trying to prove constraints from known facts
        {
            let solvedConstraints = moveTowardConstraints(this.facts, this.constraints);

            if (solvedConstraints.length !== 0) {
                this.facts = this.facts.concat(solvedConstraints);
                result = Result.Progress;
            }
        }
        */

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
        // Dumb way of detecting conclusion

        for (let fact of this.facts) {
            if (areExprsIdentical(fact, this.conclusion)) {
                return fact;
            }
        }

        return null;
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
