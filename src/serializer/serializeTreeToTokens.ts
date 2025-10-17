import Comparator from "../data_structures/Comparator";
import RGBvalue from "../data_structures/RGBvalue";
import Tree from "../data_structures/Tree";
export const serializeTreeToTokens: (tree: Tree) => string[] = tree => Array.from(tree.entries()).map(([key, value]) => {
    if (typeof value === "string") {
        return [key, "=", value];
    } else if (value instanceof Comparator) {
        return [key, value.mode, value.value];
    } else if (value instanceof RGBvalue) {
        return [key, "=", "rgb", "{", ...value, "}"];
    } else if (value instanceof Tree) {
        return [key, "=", "{", ...serializeTreeToTokens(value).flat(), "}"];
    }
    return [] as string[];
}).flat();
export default serializeTreeToTokens;
