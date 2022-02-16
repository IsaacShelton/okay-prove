
import { areExprsIdentical, Ast, AstExpr } from './ast';
import { breakDown } from './breakDown';
import { byPremise } from './justification';

export class Structure {
    facts: AstExpr[];
    constraints: AstExpr[];

    constructor(ast: Ast) {
        this.facts = ast.premises.map(byPremise);
        this.constraints = [ast.conclusion];
    }

    step(): Result {
        let oldFactsLength = this.facts.length;
        let oldConstraintsLength = this.constraints.length;

        // Work backward by breaking down constraints
        this.constraints = breakDown(this.constraints);

        // Work forward by breaking down known facts
        this.facts = breakDown(this.facts);

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

        if (this.areConstraintsSatisfied()) {
            return Result.Complete;
        } else if (this.facts.length != oldFactsLength || this.constraints.length != oldConstraintsLength) {
            return Result.Progress;
        } else {
            return Result.Stagnant;
        }
    }

    areConstraintsSatisfied(): boolean {
        for (let constraint of this.constraints) {
            if (!this.hasFact(constraint)) {
                return false;
            }
        }

        return true;
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

export enum Result {
    Stagnant,
    Progress,
    Complete
}

export function combineResultValues(a: Result, b: Result) {
    if (a == Result.Complete || b == Result.Complete) return Result.Complete;
    if (a == Result.Progress || b == Result.Progress) return Result.Progress;
    return Result.Stagnant;
}

export function okayProve(ast: Ast): boolean {
    let structure = new Structure(ast);

    while (true) {
        let result = structure.step();

        switch (result) {
            case Result.Stagnant:
                return false;
            case Result.Progress:
                continue;
            case Result.Complete:
                return true;
        }
    }
}
