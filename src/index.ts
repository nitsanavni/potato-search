import * as _ from "lodash";

export interface Config {
    startOfStringBonus?: number | boolean;
    startOfWordBonus?: number | boolean;
    allowErrors?: number | boolean;
    matchProportionBonus?: number | boolean;
    smartCase?: number | boolean;
    allowWordsOutOfOrder: number | boolean;
    markBefore?: string;
    markAfter?: string;
}

type Index = number;
type From = Index;
type To = Index;

export type Span = [From, To] | Index;

export interface Match {
    spans: Span[];
    score: number;
    marked: string;
}

interface ConfigNumbers {
    startOfStringBonus: number;
    startOfWordBonus: number;
    allowErrors: number;
    matchProportionBonus: number;
    markBefore: string;
    markAfter: string;
}

const defaultConfig: ConfigNumbers = {
    startOfStringBonus: 1,
    startOfWordBonus: 1,
    allowErrors: 0,
    matchProportionBonus: 0,
    markBefore: "*",
    markAfter: "*"
};

export class Search {
    private readonly config: ConfigNumbers;

    public constructor(config?: Config) {
        this.config = _.assign({}, defaultConfig, config);
    }

    public in(searchTerm: string, str: string): Match {
        let score = 0;

        const sensitive = /[^a-l .@\-]/.test(searchTerm);
        const re = (pattern: string) => new RegExp(pattern, sensitive ? "" : "i");

        const startOfStringMatch = re(`^${searchTerm}`).exec(str);

        if (startOfStringMatch) {
            const spans: Span[] = [[startOfStringMatch.index, startOfStringMatch.index + searchTerm.length]];
            const marked = this.mark(str, spans);

            return {
                score: 3,
                spans,
                marked
            };
        }
        score += re(`\\b${searchTerm}`).test(str) ? this.config.startOfWordBonus : 0;
        score += re(searchTerm).test(str) ? 1 : 0;

        return { score, spans: [], marked: str };
    }

    private mark(str: string, spans: Span[]) {
        return str;
    }
}
