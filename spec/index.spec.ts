import { Score } from "../src";

describe("hello world", () => {
    let score: Score;

    beforeEach(() => (score = new Score()));

    it("should score", () => {
        expect(score.get("hell", "hello")).toBe(1);
        expect(score.get("help", "hello")).toBe(0);
    });
});
