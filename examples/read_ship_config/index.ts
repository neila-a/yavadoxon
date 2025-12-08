import {
    readdirSync,
    readFileSync,
    writeFileSync
} from "node:fs";
import {
    join,
    normalize
} from "node:path";
import {
    stdin as input,
    stdout as output
} from "node:process";
import {
    createInterface
} from "node:readline/promises";
import {
    isMainThread,
    parentPort,
    Worker
} from "node:worker_threads";
import convert from "yavadoxon";
import Tree from "yavadoxon/data_structures/Tree";
type hull = Record<string, string[]>;
type hulls = Record<string, hull>;
function hullToModules(hull: Tree, parent = {
} as hull) {
    const moduleSlots = hull.get("module_slots") as Tree | "inherit";
    if (moduleSlots === undefined) {
        return {
        } as hull;
    }
    if (moduleSlots === "inherit") {
        return parent;
    }
    const modules = {
    } as hull;
    moduleSlots.forEach((info, module) => {
        if (info === "inherit") {
            modules[module] = parent[module];
        } else if (info instanceof Tree) {
            modules[module] = info.get("allowed_module_categories") as string[];
        }
    });
    return modules;
}
interface infoMessage {
    fileName: string;
    equipmentPath: string;
}
type calculatedMessage = [string, hulls];
if (isMainThread) {
    const
        readLine = createInterface({
            input,
            output
        }),
        // eslint-disable-next-line max-len
        rootPath = "/home/neila/.local/share/Steam/steamapps/common/Hearts of Iron IV/", //await readLine.question("Please enter root path to HOI4 installation of your mod: ")
        equipmentPath = normalize(rootPath + "/common/units/equipment/"),
        fileNames = readdirSync(equipmentPath).filter(fileName => fileName.startsWith("ship_hull_")),
        JSONspacing = 4,
        files = Object.fromEntries(await Promise.all(fileNames.map(fileName => new Promise(resolve => {
            const worker = new Worker(new URL(import.meta.url));
            worker.postMessage({
                fileName,
                equipmentPath
            } as infoMessage);
            worker.once("message", (message: calculatedMessage) => {
                resolve(message);
            });
        }) as Promise<calculatedMessage>)));
    readLine.close();
    writeFileSync("ship_config.json", JSON.stringify(files, null, JSONspacing));
} else {
    parentPort?.once("message", (message: infoMessage) => {
        const
            {
                fileName,
                equipmentPath
            } = message,
            name = fileName.replace("ship_hull_", "").replace(".txt", ""),
            equipments = convert(readFileSync(join(equipmentPath, fileName)).toString()).get("equipments") as Tree,
            archetypes = {
            } as hulls,
            hulls = {
            } as hulls;
        equipments.forEach((hull, hullName) => {
            if (hull instanceof Tree) {
                if (hull.get("is_archetype") === "yes") {
                    archetypes[hullName] = hullToModules(hull);
                } else if (!hull.has("parent")) {
                    hulls[hullName] = hullToModules(hull, archetypes[hull.get("archetype") as string]);
                } else {
                    hulls[hullName] = hullToModules(hull, hulls[hull.get("parent") as string]);
                }
            }
        });
        parentPort?.postMessage([name, hulls] as calculatedMessage);
    });
}
