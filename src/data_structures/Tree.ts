import Comparator from "./Comparator";
import RGBvalue from "./RGBvalue";
export type TreeValue = string | Comparator | RGBvalue | Tree | string[];
// eslint-disable-next-line @typescript-eslint/no-namespace
namespace JSONparser {
    export const all = (json: string) => JSON.parse(json);
    export const first = (entry: [string, TreeValue]) => [JSON.parse(entry[0]), entry[1]];
}
/**
 * 相当于MultiValueMap
 */
export default class Tree {
    map = new Map<string, TreeValue>();
    [Symbol.toStringTag] = "Tree";

    /**
     * 获取值
     * @param key 键
     * @param index -1表示获取所有值，0表示获取第一个值，1表示获取第二个值，依此类推，默认为0
     */
    get(key: string, index = 0): TreeValue | TreeValue[] | undefined {
        switch (index) {
            case -1: {
                const values: TreeValue[] = [];
                Array.from(this.map.entries()).map(JSONparser.first).forEach(([keyWithIndex, value]) => keyWithIndex[0] === key && values.push(value));
                return values;
            }
            default: {
                let value: TreeValue | undefined = undefined;
                Array
                    .from(this.map.entries())
                    .map(JSONparser.first)
                    .forEach(([keyWithIndex, gotValue]) => keyWithIndex[0] === key && keyWithIndex[1] === index && (value = gotValue));
                return value;
            }
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
                Array.from(this.map.keys()).map(JSONparser.all).forEach(got => got[0] === key && this.map.delete(JSON.stringify(got)));
                break;
            default:
                Array.from(this.map.keys()).map(JSONparser.all).forEach(got => got[0] === key && got[1] === index && this.map.delete(JSON.stringify(got)));
                break;
        }
    }
    entries() {
        return Array
            .from(this.map.entries())
            .map(JSONparser.first)
            .map(([keyWithIndex, value]) => [keyWithIndex[0], value] as [string, TreeValue])[Symbol.iterator]();
    }
    // thisArg必须为any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        Array.from(this.map.keys()).map(JSONparser.all).forEach(got => got[0] === key && count++);
        return count;
    }
    keys() {
        return Array.from(this.map.keys()).map(JSONparser.all).map(keyWithIndex => keyWithIndex[0]);
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
