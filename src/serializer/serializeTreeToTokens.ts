import Comparator from "../data_structures/Comparator";
import RGBvalue from "../data_structures/RGBvalue";
import Tree from "../data_structures/Tree";
const serializeTreeToTokens: (tree: Tree) => string[] = tree => Array
    .from(tree.entries())
    .map(([key, value]) => typeof value === "string" ? [key, "=", value]
        : value instanceof Comparator ? [key, value.mode, value.value]
            : value instanceof RGBvalue ? [key, "=", "rgb", "{", ...value, "}"]
                : value instanceof Array ? [key, "=", "{", ...value, "}"]
                    : value instanceof Tree ? [key, "=", "{", ...serializeTreeToTokens(value).flat(), "}"] : [] as string[]
    )
    .flat();
export default serializeTreeToTokens;
