import * as _ from "lodash";

import { Search, Span } from "../src";

describe("Search", () => {
    let search: Search;

    beforeEach(() => (search = new Search()));

    // TODO - non-English
    // TODO - more score if closer to start of string
    // TODO - more score if covers more of string
    // TODO - multi-part terms & out-of-order-multi-part terms
    // TODO - support accented chars - can use _.deburr
    _.each(
        [
            ["hell", "hello", 3, "*hell*o"],
            ["world", "hello world", 2, "hello *world*"],
            ["ell", "hello", 1, "h*ell*o"],
            ["help", "hello", 0, "hello"],
            ["Hell", "hello", 0, "hello"],
            ["hell", "Hello", 3, "*Hell*o"],
            ["wereld", "hallo wêreld", 2, "hallo *wêreld*"]
        ],
        ([searchTerm, str, expectedScore, marked]: [string, string, number, string]) =>
            it(`should search(${searchTerm}, ${str}) = ${expectedScore}, ${marked}`, () => {
                const res = search.term(searchTerm).in(str);
                expect(res.score).toBe(expectedScore);
                expect(res.marked).toEqual(marked);
            })
    );

    function mark(str: string, spans: Span[]) {
        const b = "<1>";
        const a = "</1>";
        let ret = "";
        let p = 0;
        const normalized = _.map(spans, (span) => (_.isNumber(span) ? [span, span + 1] : span));
        _.each(normalized, (span) => {
            ret = ret + `${str.substring(p, span[0])}${b}${str.substring(span[0], span[1])}${a}`;
            p = span[1];
        });
        ret = ret + str.substring(p);

        return ret;
    }

    it("should mark", () => {
        expect(mark("hello world", [[1, 3], 7])).toEqual("h<1>el</1>lo w<1>o</1>rld");
        expect(mark("hello world", [])).toEqual("hello world");
        expect(mark("hello world", [7])).toEqual("hello w<1>o</1>rld");
    });
});
