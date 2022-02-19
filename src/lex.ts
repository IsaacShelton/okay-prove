
import { CustomError } from 'ts-custom-error';

export enum TokenKind {
    NextLine,
    Open,
    Close,
    Symbol,
    Not,
    And,
    Or,
    Implies,
    Tautology,
    Contradiction,
};

export type Token =
    | { type: TokenKind.NextLine }
    | { type: TokenKind.Open }
    | { type: TokenKind.Close }
    | { type: TokenKind.Symbol, name: string }
    | { type: TokenKind.Not }
    | { type: TokenKind.And }
    | { type: TokenKind.Or }
    | { type: TokenKind.Implies }
    | { type: TokenKind.Tautology }
    | { type: TokenKind.Contradiction }

export class LexError extends CustomError {
    constructor(reason: string) {
        super(reason);
    }
}

export function lex(content: string): Token[] | LexError {
    let words = splitAndKeep(content, [' ', '(', ')', '\n']).filter((x) => !x.match(/^[ \t]*$/));

    try {
        return words.map((word) => {
            switch (word) {
                case '\n':
                    return { type: TokenKind.NextLine };
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
                case '.':
                    return { type: TokenKind.Tautology };
                case '!':
                    return { type: TokenKind.Contradiction };
            }

            if (isValidVariableName(word)) {
                return { type: TokenKind.Symbol, name: word };
            }

            throw new LexError("Invalid character in content");
        });
    } catch (e) {
        if (e instanceof LexError) {
            return e;
        } else {
            throw e;
        }
    }
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
