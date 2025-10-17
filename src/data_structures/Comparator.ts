export const compareSigns: ["<=", ">=", "==", "<", ">"] = ["<=", ">=", "==", "<", ">"];
export type compareSign = typeof compareSigns[number];
export default class Comparator {
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
