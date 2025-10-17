const nowEmptyFilter = (token: string) => token !== "";
/**
 * 分解token 
 */
function parseParadoxCodeToTokens(code: string) {
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
type TreeKey = [key: string, index: number];
type TreeValue = string | Comparator | RGBvalue | Tree;
/**
 * 相当于MultiValueMap
 */
class Tree {
    map = new Map<string, TreeValue>();
    [Symbol.toStringTag]: string = "Tree";

    /**
     * 获取值
     * @param key 键
     * @param index -1表示获取所有值，0表示获取第一个值，1表示获取第二个值，依此类推，默认为0
     */
    get(key: string, index = 0): TreeValue | TreeValue[] | undefined {
        switch (index) {
            case -1:
                const values: TreeValue[] = [];
                Array.from(this.map.entries()).map(entry => [JSON.parse(entry[0]), entry[1]]).forEach(([keyWithIndex, value]) => keyWithIndex[0] === key && values.push(value));
                return values;
            default:
                let value: TreeValue | undefined = undefined;
                Array.from(this.map.entries()).map(entry => [JSON.parse(entry[0]), entry[1]]).forEach(([keyWithIndex, gotValue]) => keyWithIndex[0] === key && keyWithIndex[1] === index && (value = gotValue));
                return value;
        }
    }
    /**
     * 设置值
     * @param key 键
     * @param value 值
     * @param index -1表示设置所有值，0表示设置第一个值，1表示设置第二个值，依此类推，默认为-1
     * @returns 设置完的`Tree`实例
     */
    set(key: string, value: TreeValue, index = -1) {
        switch (index) {
            case -1:
                this.delete(key);
                this.map.set(JSON.stringify([key, 0]), value);
                break;
            default:
                this.map.set(JSON.stringify([key, index]), value);
                break;
        }
        return this;
    }
    clear() {
        return this.map.clear();
    }
    /**
     * 删除某个键的值
     * @param index -1表示删除所有值，0表示删除第一个值，1表示删除第二个值，依此类推，默认为-1
     */
    delete(key: string, index = -1) {
        switch (index) {
            case -1:
                Array.from(this.map.keys()).map(json => JSON.parse(json)).forEach(got => got[0] === key && this.map.delete(JSON.stringify(got)));
                break;
            default:
                Array.from(this.map.keys()).map(json => JSON.parse(json)).forEach(got => got[0] === key && got[1] === index && this.map.delete(JSON.stringify(got)));
                break;
        }
    }
    entries() {
        return Array.from(this.map.entries()).map(entry => [JSON.parse(entry[0]), entry[1]]).map(([keyWithIndex, value]) => [keyWithIndex[0], value] as [string, TreeValue])[Symbol.iterator]();
    }
    forEach(callbackfn: (value: TreeValue, key: string, tree: Tree) => void, thisArg?: any) {
        return this.map.forEach((value, keyWithIndex) => callbackfn(value, JSON.parse(keyWithIndex)[0], this), thisArg);
    }
    /**
     * 是否有某个键
     * @param key 键
     */
    has(key: string) {
        return this.map.has(JSON.stringify([key, 0]));
    }
    /**
     * 一个键对应多少个值
     * @param key 键
     */
    valueCount(key: string) {
        let count = 0;
        Array.from(this.map.keys()).map(json => JSON.parse(json)).forEach(got => got[0] === key && count++);
        return count;
    }
    keys() {
        return Array.from(this.map.keys()).map(json => JSON.parse(json)).map(keyWithIndex => keyWithIndex[0]);
    }
    values() {
        return this.map.values();
    }
    get size() {
        return this.map.size;
    }
    [Symbol.iterator]() {
        return this.entries();
    }
}
class RGBvalue extends Array { }
const compareSigns: ["<=", ">=", "==", "<", ">"] = ["<=", ">=", "==", "<", ">"];
type compareSign = typeof compareSigns[number];
class Comparator {
    mode: compareSign = "==";
    value: string = "";
    constructor(mode: compareSign, value: string) {
        this.mode = mode;
        this.value = value;
    }
    toString() {
        return `${this.mode} ${this.value}`;
    }
}
function parseTokensToTree(tokens: string[]) {
    const tree = new Tree();
    const working: string[] = [];
    function modifyObjectWithWorking(modifier: (newer: TreeValue) => TreeValue) {
        let now = tree;
        for (const segment of working.slice(0, -1)) {
            const lastValueIndex = now.valueCount(segment) - 1;
            const got = now.get(segment, lastValueIndex);
            if (got === undefined || lastValueIndex === -1) {
                const newTree = new Tree();
                now.set(segment, newTree, lastValueIndex);
                now = newTree;
            } else {
                now = got as unknown as Tree;
            }
        }
        const lastWorkingIndex = working[working.length - 1];
        const lastValueIndex = now.valueCount(lastWorkingIndex);
        now.set(lastWorkingIndex, modifier(now.get(lastWorkingIndex, lastValueIndex) as Tree), lastValueIndex);
    }
    let compareMode: compareSign | false = false;
    let workingArray: TreeValue[] = [];
    /**
     * 例如`a = c`中，left = "a"，middle = "="，right = "c"
     */
    enum positions {
        left,
        middle,
        right
    }
    let at: positions = positions.left;
    for (const token of tokens) {
        // 开始对象
        if (token === "{") {
            at = positions.left;
        }
        // 结束对象
        else if (token === "}") {
            if (at === positions.middle) {
                workingArray.push(working[working.length - 1]);
                working.pop();
            }
            if (workingArray.length > 0) {
                modifyObjectWithWorking(() => workingArray);
                workingArray = [];
            }
            working.pop();
            at = positions.left;
        }

        // 键
        else if (at === positions.left) {
            working.push(token);
            at = positions.middle;
        }
        // 中间符号
        else if (at === positions.middle) {
            // 键值对
            if (token === "=") {
                at = positions.right;
            }
            else if (compareSigns.includes(token as compareSign)) {
                compareMode = token as compareSign;
                at = positions.right;
            }
            // 数组
            else {
                workingArray.push(working[working.length - 1], token);
                working.pop();
                at = positions.left;
            }
        }
        // 值
        else if (at === positions.right) {
            // rgb
            if (token === "rgb") {
                workingArray = new RGBvalue();
            }
            else if (compareMode !== false) {
                modifyObjectWithWorking(() => new Comparator(compareMode as compareSign, token));
                compareMode = false;
                working.pop();
                at = positions.left;
            }
            else {
                modifyObjectWithWorking(() => token);
                working.pop();
                at = positions.left;
            }
        }
    }
    return tree;
}
const signs = ["=", "= rgb", ...compareSigns];
function stringifyTokensToParadoxCode(tokens: string[]) {
    let tokensWithIndent: (string | string[])[] = [];
    let indent = 0;
    let last4Tokens: [string, string, string, string] = ["", "", "", ""];
    let inArray = false;
    const breakLine = () => tokensWithIndent.push(["\n"].concat(Array(indent).fill("\t")));
    for (const token of tokens) {
        tokensWithIndent.push(token);
        last4Tokens = [last4Tokens[1], last4Tokens[2], last4Tokens[3], token];

        if (token === "rgb") {
            tokensWithIndent[tokensWithIndent.length - 2] = [""];
            tokensWithIndent[tokensWithIndent.length - 1] = signs[1]; // 合并为同一个token
        } else if (token === "{") {
            indent++;
            breakLine();
        } else if (token === "}") {
            indent--;
            if (!inArray) {
                const lastIndentArray = tokensWithIndent[tokensWithIndent.length - 2] as string[];
                lastIndentArray.pop(); // 移除之前的一个缩进
            }
            breakLine();
            inArray = false;
        } else if (signs.includes(last4Tokens[2])) {
            breakLine();
        } else if (signs.every(sign => last4Tokens.every(t => t !== sign)) && last4Tokens[0] === "{") {
            // 数组
            const lastIndentArray = tokensWithIndent[tokensWithIndent.length - 4] as string[];
            lastIndentArray.fill(""); // 移除之前的一个换行
            inArray = true;
        }
    }
    return tokensWithIndent.map(stringOrArray => Array.isArray(stringOrArray) ? stringOrArray.join("") : stringOrArray + " ").filter(nowEmptyFilter).join("").split("\n").map(line => line.trimEnd()).join("\n");
}
const stringifyTreeToTokens: (tree: Tree) => string[] = tree => Array.from(tree.entries()).map(([key, value]) => {
    if (typeof value === "string") {
        return [key, "=", value];
    } else if (value instanceof Comparator) {
        return [key, value.mode, value.value];
    } else if (value instanceof RGBvalue) {
        return [key, "=", "rgb", "{", ...value, "}"];
    } else if (value instanceof Tree) {
        return [key, "=", "{", ...stringifyTreeToTokens(value).flat(), "}"];
    }
    return [] as string[];
}).flat();
function convert(code: string): Tree;
function convert(tree: Tree): string;
function convert(input: string | Tree) {
    if (typeof input === "string") {
        const tokens = parseParadoxCodeToTokens(input);
        return parseTokensToTree(tokens);
    } else if (typeof input === "object" && input instanceof Tree) {
        const tokens = stringifyTreeToTokens(input);
        return stringifyTokensToParadoxCode(tokens);
    }
}
const code = `a = {
	str = "String \\ \\"queue\\" / stringG"
	arr = { 1 1 4 5 1 4 }
	obj = {
		key = value1
		key = value2
	}
	color = rgb { 191 919 810 }
	compare > 3
}`;
let t = convert(code);
t.set("outsideModified", "114514");
let r = convert(t);
console.log(r);