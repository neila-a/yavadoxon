import noEmptyFilter from "../utils/noEmptyFilter";
import {
    compareSigns
} from "../data_structures/Comparator";
const signs = ["=", "= rgb", ...compareSigns];
export default function serializeTokensToParadoxCode(tokens: string[]) {
    const tokensWithIndent: (string | string[])[] = [];
    let indent = 0;
    let last4Tokens: [string, string, string, string] = ["", "", "", ""];
    let inArray = false;
    const breakLine = () => tokensWithIndent.push(["\n"].concat(Array(indent).fill("\t")));
    for (const token of tokens) {
        tokensWithIndent.push(token);
        last4Tokens = [last4Tokens[1], last4Tokens[2], last4Tokens[3], token];

        if (token === "rgb") {
            // eslint-disable-next-line no-magic-numbers
            tokensWithIndent[tokensWithIndent.length - 2] = [""];
            tokensWithIndent[tokensWithIndent.length - 1] = signs[1]; // 合并为同一个token
        } else if (token === "{") {
            indent++;
            breakLine();
        } else if (token === "}") {
            indent--;
            if (!inArray) {
                // 缩进 item
                // eslint-disable-next-line no-magic-numbers
                const lastIndentArray = tokensWithIndent[tokensWithIndent.length - 2] as string[];
                lastIndentArray.pop(); // 移除之前的一个缩进
            }
            breakLine();
            inArray = false;
        } else if (signs.includes(last4Tokens[2])) {
            breakLine();
        } else if (signs.every(sign => last4Tokens.every(t => t !== sign)) && last4Tokens[0] === "{") {
            // 数组
            // 换行 { item item
            // eslint-disable-next-line no-magic-numbers
            const lastIndentArray = tokensWithIndent[tokensWithIndent.length - 4] as string[];
            lastIndentArray.fill(""); // 移除之前的一个换行
            inArray = true;
        }
    }
    return tokensWithIndent
        .map(stringOrArray => Array.isArray(stringOrArray) ? stringOrArray.join("") : stringOrArray + " ")
        .filter(noEmptyFilter)
        .join("")
        .split("\n")
        .map(line => line.trimEnd())
        .join("\n");
}
