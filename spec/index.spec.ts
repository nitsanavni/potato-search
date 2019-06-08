import * as _ from "lodash";

import { Search, Span } from "../src";

describe("score", () => {
    let search: Search;

    beforeEach(() => (search = new Search()));

    // TODO - non-English
    // TODO - results in markdown
    _.each(
        [
            ["hell", "hello", 3, [[0, 4]]]
            // ["world", "hello world", 2],
            // ["ell", "hello", 1],
            // ["help", "hello", 0],
            // ["Hell", "hello", 0],
            // ["hell", "Hello", 3]
        ],
        ([searchTerm, str, expectedScore, spans]: [string, string, number, Span[]]) =>
            it(`should score(${searchTerm}, ${str}) = ${expectedScore}`, () => {
                const res = search.in(searchTerm, str);
                expect(res.score).toBe(expectedScore);
                expect(res.spans).toEqual(spans);
            })
    );
});
