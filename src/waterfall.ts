
import assert from "assert";
import { AstExpr } from "./ast";
import { justifyUnsafe, Reasoning } from "./justification";

// Representation of how to get from simplified conclusion
// back to the real conclusion
//
//  e.g.
//
//                               real conclusion
//             [0]  |  ( (not not not a) and (not not not b) )
//             [1]  |  ( (not a) and (not not not b) )               [double negation]   |  [0]
//  conclusions ----|  ( (not a) and (not b) )                       [double negation]   |---- reasonings
//             [3]  |  ( not (a and b) )                             [de morgan's]       |  [2]
//                             simplified conclusion
//
export class Waterfall {
    constructor(public reasonings: Reasoning[], public conclusionWaterfall: AstExpr[]) { }

    unwind(reachedSimplification: AstExpr): AstExpr {
        assert(this.conclusionWaterfall.length == this.reasonings.length + 1, "Expected proper number of justifications to trace from simplified conclusion back to real conclusion");

        let running = reachedSimplification;

        // NOTE: We don't care about the last one, since that is what we reached
        for (let i = this.reasonings.length - 1; i >= 0; i--) {
            // Assume that each reasoning we use requires one and only one reference
            running = justifyUnsafe(this.conclusionWaterfall[i - 1], this.reasonings[i], running);
        }

        return running;
    }
}
