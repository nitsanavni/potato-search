import * as _ from "lodash";

export interface Config {
    startOfStringBonus?: number | boolean;
    startOfWordBonus?: number | boolean;
    allowErrors?: number | boolean;
    matchProportionBonus?: number | boolean;
    smartCase?: number | boolean;
    allowWordsOutOfOrder?: number | boolean;
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
    // TODO - whole word bonus
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
    private searchTerm: string = "";
    private sensitive: boolean = false;

    public constructor(config?: Config) {
        this.config = _.assign({}, defaultConfig, config);
    }

    public term(searchTerm: string): Search {
        this.searchTerm = searchTerm;
        this.sensitive = /[^a-z .@\-]/.test(searchTerm);

        return this;
    }

    public in(str: string): Match {
        const sensitive = this.sensitive;
        const term = this.searchTerm;
        const re = (pattern: string) => new RegExp(pattern, sensitive ? "" : "i");

        let match;
        let score = 3;
        const patterns = [`^${term}`, `\\b${term}`, term];
        for (let pattern of patterns) {
            match = re(pattern).exec(str);

            if (match) {
                const spans: Span[] = [[match.index, match.index + term.length]];
                const marked = this.mark(str, spans);

                return { score, spans, marked };
            } else {
                score--;
            }
        }

        return { score, spans: [], marked: str };
    }

    private mark(str: string, spans: Span[]) {
        const b = this.config.markBefore;
        const a = this.config.markAfter;
        let ret = "";
        let p = 0;
        const normalized = _.map(spans, (span) => (_.isNumber(span) ? [span, span + 1] : span));
        _.each(normalized, (span) => {
            ret += `${str.substring(p, span[0])}${b}${str.substring(span[0], span[1])}${a}`;
            p = span[1];
        });
        ret += str.substring(p);

        return ret;
    }
}
