import * as _ from "lodash";

import { Search } from "../src";

describe("score", () => {
    let search: Search;

    beforeEach(() => (search = new Search()));

    _.each(
        [
            ["hell", "hello", 3],
            ["world", "hello world", 2],
            ["ell", "hello", 1],
            ["help", "hello", 0],
            ["Hell", "hello", 0],
            ["hell", "Hello", 3]
        ],
        ([searchTerm, str, expectedScore]: [string, string, number]) =>
            it(`should score(${searchTerm}, ${str}) = ${expectedScore}`, () =>
                expect(search.in(searchTerm, str).score).toBe(expectedScore))
    );
});
