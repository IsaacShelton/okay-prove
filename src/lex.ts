
export enum TokenKind {
    Open,
    Close,
    Symbol,
    Not,
    And,
    Or,
    Implies,
};

export type Token =
    | { type: TokenKind.Open }
    | { type: TokenKind.Close }
    | { type: TokenKind.Symbol, name: string }
    | { type: TokenKind.Not }
    | { type: TokenKind.And }
    | { type: TokenKind.Or }
    | { type: TokenKind.Implies }

export class LexError {
    reason: string;

    constructor(reason: string){
        this.reason = reason;
    }
}

export function lex(content: string): Token[] | LexError {
    let words = splitAndKeep(content, [' ', '(', ')']).filter((x) => x !== '');
    let tokens: Token[] = [];

    try {
        tokens = words.map((word) => {
            switch (word) {
                case '(':
                    return { type: TokenKind.Open };
                case ')':
                    return { type: TokenKind.Close };
                case 'not':
                    return { type: TokenKind.Not };
                case 'and':
                    return { type: TokenKind.And };
                case 'or':
                    return { type: TokenKind.Or };
                case 'implies':
                    return { type: TokenKind.Implies };
            }

            if (isValidVariableName(word)) {
                return { type: TokenKind.Symbol, name: word };
            }

            throw new LexError("Invalid character in content");
        });
    } catch(e){
        if(e instanceof LexError){
            return e;
        } else {
            throw e;
        }
    }

    return tokens;
}

// Implementation based off publicly available implementation 'https://stackoverflow.com/a/57329458'
function splitAndKeep(string: string, separator: string | string[]) {
    function splitAndKeep(string: string, separator: string) {
        return string.split(new RegExp(`(${escapeRegex(separator)})`, 'g'));
    }

    if (Array.isArray(separator)) {
        let parts = splitAndKeep(string, separator[0]);

        separator.slice(1).forEach((eachSeparator) => {
            let previousParts = parts;
            parts = [];

            previousParts.forEach((eachPreviousPart) => {
                parts = parts.concat(splitAndKeep(eachPreviousPart, eachSeparator));
            });
        });

        return parts;
    } else {
        return splitAndKeep(string, separator);
    }
};

// Implementation based off publicly available implementation 'https://stackoverflow.com/a/57329458'
function escapeRegex(string: string) {
    return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
}

function isValidVariableName(variableName: string) {
    return /^[a-zA-Z_0-9]+$/.test(variableName);
}
