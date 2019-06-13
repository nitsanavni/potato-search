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
    escape?: boolean;
    deburr?: boolean;
    multipart?: boolean;
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
    escape: boolean;
    deburr: boolean;
    multipart: boolean;
}

const defaultConfig: ConfigNumbers = {
    startOfStringBonus: 1,
    startOfWordBonus: 1,
    allowErrors: 0,
    matchProportionBonus: 0,
    markBefore: "*",
    markAfter: "*",
    escape: true,
    deburr: true,
    multipart: true
};

const specialChars = /[-[\]{}()*+?.,\\^$|#\s]/g;

function escapeRegExp(text: string) {
    return _.clone(text).replace(specialChars, "\\$&");
}

export class Search {
    private readonly config: ConfigNumbers;
    private searchTerm: string = "";
    private sensitive: boolean = false;
    private multipartRe: RegExp | null = null;

    public constructor(config?: Config) {
        this.config = _.assign({}, defaultConfig, config);
    }

    public term(searchTerm: string): Search {
        this.sensitive = /[^a-z .@\-]/.test(searchTerm);
        this.searchTerm = this.config.escape ? escapeRegExp(searchTerm) : searchTerm;

        if (this.config.multipart && !specialChars.test(searchTerm)) {
            const pattern = `\\b${_.join(_.map(_.split(searchTerm, ""), (c) => `(${c})`), "((?:.*?)\\b){0,1}?")}`;
            this.multipartRe = new RegExp(pattern, this.sensitive ? "" : "i");
        }

        return this;
    }

    public in(str: string): Match {
        const sensitive = this.sensitive;
        const term = this.searchTerm;
        const re = (pattern: string) => new RegExp(pattern, sensitive ? "" : "i");

        const deburrStr = this.config.deburr ? _.deburr(str) : str;

        let match;
        let score = 3;
        const patterns = [`^${term}`, `\\b${term}`, term];
        for (let pattern of patterns) {
            match = re(pattern).exec(deburrStr);

            if (match) {
                const spans: Span[] = [[match.index, match.index + match[0].length]];
                const marked = this.mark(str, spans);

                return { score, spans, marked };
            } else {
                score--;
            }
        }

        if (this.multipartRe) {
            match = this.multipartRe.exec(deburrStr);

            if (match) {
                const score = 3;
                const spans = this.multipartSpans(match);
                const marked = this.mark(str, spans);

                return { score, spans, marked };
            }
        }

        return { score, spans: [], marked: str };
    }

    private multipartSpans(match: RegExpExecArray): Span[] {
        const spans1: number[] = [];

        for (var g = 1, ix = match.index; g < match.length; ix += match[g] ? match[g].length : 0, g++) {
            if (g % 2) {
                spans1.push(ix);
            }
        }

        const spans: Span[] = [];
        let s = spans1[0];
        let e = s + 1;

        _.reduce(spans1, (p, c) => {
            if (p == c - 1) {
                e++;
            } else {
                spans.push([s, e]);
                s = c;
                e = s + 1;
            }
            return c;
        });

        spans.push([s, e]);

        return spans;
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
