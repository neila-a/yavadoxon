import {
    defineConfig
} from "tsup";
export default defineConfig({
    entry: ["src/index.ts", "src/data_structures/Tree.ts"],
    sourcemap: true,
    clean: true,
    dts: true,
    //minify: true,
    format: ["cjs", "esm", "iife"],
    target: "esnext"
});
