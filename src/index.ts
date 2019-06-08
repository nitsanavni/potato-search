import * as _ from "lodash";

export interface Config {
    startOfStringBonus?: number | boolean;
    startOfWordBonus?: number | boolean;
    allowErrors?: number | boolean;
    matchProportionBonus?: number | boolean;
    smartCase?: number | boolean;
    allowWordsOutOfOrder: number | boolean;
}

type Index = number;
type From = Index;
type To = Index;

export type Span = [From, To] | Index;

export interface Match {
    spans: Span[];
    score: number;
}

interface ConfigNumbers {
    startOfStringBonus: number;
    startOfWordBonus: number;
    allowErrors: number;
    matchProportionBonus: number;
}

const defaultConfig: ConfigNumbers = {
    startOfStringBonus: 1,
    startOfWordBonus: 1,
    allowErrors: 0,
    matchProportionBonus: 0
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

        score += re(searchTerm).test(str) ? 1 : 0;
        score += re(`^${searchTerm}`).test(str) ? this.config.startOfStringBonus : 0;
        score += re(`\\b${searchTerm}`).test(str) ? this.config.startOfWordBonus : 0;

        return { score, spans: [] };
    }
}
