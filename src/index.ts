export interface Config {}

export class Score {
    public constructor(config?: Config) {}

    public get(searchTerm: string, str: string): number {
        return new RegExp(searchTerm).test(str) ? 1 : 0;
    }
}
