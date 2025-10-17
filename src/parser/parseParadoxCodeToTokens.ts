import noEmptyFilter from "../utils/noEmptyFilter";
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
            if (last3chars[1] === "\\" && last3chars[0] !== "\\") {
                // 字符串内的转义字符
                workingToken += char;
            } else if (inString === false) {
                // 开始字符串
                inString = true;
            } else {
                // 结束字符串
                tokens.push("\"" + workingToken + "\"");
                workingToken = "";
                inString = false;
            }
        } else if (inString) {
            workingToken += char;
        } else if (char === " " || char === "\t") {
            // 忽略的字符
            tokens.push(workingToken);
            workingToken = "";
        } else if (char === "#") {
            // 注释
            inComment = true;
        } else if (char === "\n") {
            tokens.push(workingToken);
            workingToken = "";
            inComment = false;
        } else if (inComment) {
            /* empty */
        } else {
            // 普通字符
            workingToken += char;
        }
    }
    tokens.push(workingToken); // 最后一个token
    tokens = tokens.filter(noEmptyFilter); // 过滤空token
    return tokens;
}
