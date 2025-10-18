import Tree from "./data_structures/Tree";
import parseParadoxCodeToTokens from "./parser/parseParadoxCodeToTokens";
import parseTokensToTree from "./parser/parseTokensToTree";
import serializeTokensToParadoxCode from "./serializer/serializeTokensToParadoxCode";
import serializeTreeToTokens from "./serializer/serializeTreeToTokens";
import compose from "compose-function";
interface convertFunction {
    (input: string): Tree
    (input: Tree): string
}
const convert: convertFunction = input => (typeof input === "string"
    ? compose(parseParadoxCodeToTokens, parseTokensToTree)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    : compose(serializeTreeToTokens, serializeTokensToParadoxCode))(input) as any;
export default convert;
