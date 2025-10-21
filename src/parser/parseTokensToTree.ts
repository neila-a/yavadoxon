import Comparator, {
    compareSign,
    signs
} from "../data_structures/Comparator";
import RGBvalue from "../data_structures/RGBvalue";
import Tree from "../data_structures/Tree";
export default function parseTokensToTree(gotTokens: string[]) {
    const tokens = ["{", ...gotTokens, "}"];
    let index = 0;
    function parseValue() {
        switch (tokens[index]) {
            case "{": {
                const signModifier = 2; // { key
                index += signModifier;
                const thisToken = tokens[index];
                if (thisToken === "}") { // 只有一个元素的数组
                    index--;
                    const array = [tokens[index]];
                    const arrayEndModifier = 2; // item }
                    index += arrayEndModifier;
                    return array;
                } else if (signs.includes(thisToken)) { // 对象
                    const tree = new Tree();
                    index--;
                    while (tokens[index] !== "}") {
                        const key = tokens[index++];
                        const thisSign = tokens[index++];
                        switch (thisSign) {
                            case "=": { // 普通键值对
                                tree.set(key, parseValue(), tree.valueCount(key));
                                break;
                            }
                            default: { // 比较器
                                const comparator = new Comparator(thisSign as compareSign, tokens[index++]);
                                tree.set(key, comparator);
                                break;
                            }
                        }
                    }
                    index++; // 跳过 }
                    return tree;
                }
                // 数组
                const array: string[] = [];
                index--;
                while (tokens[index] !== "}") {
                    array.push(tokens[index++]);
                }
                index++; // 跳过 }
                return array;
            }
            case "rgb": {
                const rgbModifer = 2; // rgb {
                index += rgbModifer;
                const color = new RGBvalue();
                color.push(tokens[index++], tokens[index++], tokens[index++]);
                index++; // 跳过 }
                return color;
            }
            default: {
                return tokens[index++];
            }
        }
    }
    return parseValue();
}
