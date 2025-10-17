import Tree from "./data_structures/Tree";
import parseParadoxCodeToTokens from "./parser/parseParadoxCodeToTokens";
import parseTokensToTree from "./parser/parseTokensToTree";
import serializeTokensToParadoxCode from "./serializer/serializeTokensToParadoxCode";
import serializeTreeToTokens from "./serializer/serializeTreeToTokens";
function convert(code: string): Tree;
function convert(tree: Tree): string;
function convert(input: string | Tree) {
    if (typeof input === "string") {
        const tokens = parseParadoxCodeToTokens(input);
        return parseTokensToTree(tokens);
    } else if (typeof input === "object" && input instanceof Tree) {
        const tokens = serializeTreeToTokens(input);
        return serializeTokensToParadoxCode(tokens);
    }
}
export default convert;