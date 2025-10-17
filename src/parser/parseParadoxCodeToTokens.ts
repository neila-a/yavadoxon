import nowEmptyFilter from "../utils/nowEmptyFilter";
/**
 * 分解token
 */
export default function parseParadoxCodeToTokens(code: string) {
    let tokens: string[] = [];
    let workingToken = "";
    let inString = false;
    let inComment = false;
    /**
     * 例如`\\"`
     */
    let last3chars: [string, string, string] = ["", "", ""];
    for (const char of code) {
        last3chars = [last3chars[1], last3chars[2], char];

        // 字符串
        if (char === "\"") {
            // 字符串内的转义字符
            if (last3chars[1] === "\\" && last3chars[0] !== "\\") {
                workingToken += char;
            }

            // 开始字符串
            else if (inString === false) {
                inString = true;
            }

            // 结束字符串
            else {
                tokens.push("\"" + workingToken + "\"");
                workingToken = "";
                inString = false;
            }
        } else if (inString) {
            workingToken += char;
        }


        // 忽略的字符
        else if (char === " " || char === "\t") {
            tokens.push(workingToken);
            workingToken = "";
        }


        // 注释
        else if (char === "#") {
            inComment = true;
        } else if (char === "\n") {
            tokens.push(workingToken);
            workingToken = "";
            inComment = false;
        } else if (inComment) {
        }


        // 普通字符
        else {
            workingToken += char;
        }
    }
    tokens.push(workingToken); // 最后一个token
    tokens = tokens.filter(nowEmptyFilter); // 过滤空token
    return tokens;
}
