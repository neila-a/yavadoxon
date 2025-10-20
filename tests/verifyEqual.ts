import {
    readFile
} from "node:fs/promises";
const testCode = await readFile("./tests/test.txt", "utf-8");
console.log("原始代码");
console.log(testCode);
import convert from "../src/index";
const tree = convert(testCode);
console.log("转换为树形结构");
console.log(tree);
const serializedCode = convert(tree);
console.log("序列化回代码");
console.log(serializedCode);
console.log("验证是否与原始代码相等：");
console.log(testCode === serializedCode ? "相等" : "不相等");