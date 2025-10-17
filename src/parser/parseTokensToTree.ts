import Comparator from "../data_structures/Comparator";
import RGBvalue from "../data_structures/RGBvalue";
import Tree from "../data_structures/Tree";
import {
    TreeValue
} from "../data_structures/Tree";
import {
    compareSign,
    compareSigns
} from "../data_structures/Comparator";
export default function parseTokensToTree(tokens: string[]) {
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
