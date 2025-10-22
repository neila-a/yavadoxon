import Comparator from "./data_structures/Comparator";
import RGBvalue from "./data_structures/RGBvalue";
import Tree from "./data_structures/Tree";
let indent = 0;
const breakLine = () => "\n" + "\t".repeat(indent);
const serializeTreeToParadoxCode = (tree: Tree) => Array.from(tree.entries()).map(([key, value]) => {
    let _return = [key];
    if (value instanceof Tree) {
        indent++;
        _return.push("=", "{" + serializeTreeToParadoxCode(value));
        indent--;
        _return = [_return.join(" ")];
        _return.unshift(breakLine());
        _return.push(breakLine(), "}");
        return _return;
    }

    if (typeof value === "string") {
        _return.push("=", value);
    } else if (value instanceof Comparator) {
        _return.push(value.mode, value.value);
    } else if (value instanceof RGBvalue) {
        _return.push("=", "rgb", "{", ...value, "}");
    } else if (value instanceof Array) {
        _return.push("=", "{", ...value, "}");
    }
    return [breakLine(), ..._return.join(" ")];
}).flat().join("");
export default (tree: Tree) => serializeTreeToParadoxCode(tree).slice(1); // 去掉开头的换行
