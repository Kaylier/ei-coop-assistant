import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import protobuf from "protobufjs";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

async function fetchJson(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    return response.json();
}

async function loadProto() {
    const protoPath = path.resolve(__dirname, "../src/assets/proto/ei.proto");
    const root = await protobuf.load(protoPath);
    return {
        CustomEgg: root.lookupType("ei.CustomEgg"),
    };
}

function generateCustomEggInfo(customEggs) {
    return customEggs.map(egg => ({
        identifier: egg.identifier,
        buffs: egg.buffs.map(buff => ({
            dimension: buff.dimension,
            value: buff.value,
        })),
    }));
}

async function main() {
    const RAW_BASE = "https://raw.githubusercontent.com/carpetsage/egg/main/periodicals/data";
    const OUTPUT_DIR = path.resolve(__dirname, "../src/assets");

    const rawCustomEggs = await fetchJson(`${RAW_BASE}/customeggs.json`);
    console.log("Custom eggs count:", rawCustomEggs.length);

    const { CustomEgg } = await loadProto();
    const decodedCustomEggs = rawCustomEggs.map(entry => CustomEgg.decode(Buffer.from(entry, "base64")));
    const customEggInfo = generateCustomEggInfo(decodedCustomEggs);

    fs.writeFileSync(path.join(OUTPUT_DIR, "custom_egg_info.json"), JSON.stringify(customEggInfo, null, 4));
    console.log("File written successfully.");
}

main();
