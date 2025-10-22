import Tree from "./data_structures/Tree";
import parseParadoxCodeToTokens from "./parser/parseParadoxCodeToTokens";
import parseTokensToTree from "./parser/parseTokensToTree";
import serializeTreeToParadoxCode from "./serializeTreeToParadoxCode";
import compose from "compose-function";
interface convertFunction {
    (input: string): Tree
    (input: Tree): string
}
const convert: convertFunction = input => (typeof input === "string"
    ? compose(parseTokensToTree, parseParadoxCodeToTokens)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    : serializeTreeToParadoxCode)(input as string & Tree) as any;
export default convert;
