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
        Contract: root.lookupType("ei.Contract"),
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

function generateContractEggs(contracts) {
    const CUSTOM_EGG = 200;
    return Object.fromEntries(
        contracts
            .filter(contract => contract.egg === CUSTOM_EGG)
            .map(contract => [contract.identifier, contract.customEggId])
    );
}

async function main() {
    const RAW_BASE = "https://raw.githubusercontent.com/carpetsage/egg/main/periodicals/data";
    const OUTPUT_DIR = path.resolve(__dirname, "../src/assets");

    const rawCustomEggs = await fetchJson(`${RAW_BASE}/customeggs.json`);
    const rawContracts = await fetchJson(`${RAW_BASE}/contracts.json`);
    console.log("Custom eggs count:", rawCustomEggs.length);
    console.log("Contracts count:", rawContracts.length);

    const { Contract, CustomEgg } = await loadProto();

    const decodedCustomEggs = rawCustomEggs.map(entry => CustomEgg.decode(Buffer.from(entry, "base64")));
    const decodedContracts = rawContracts.map(entry => Contract.decode(Buffer.from(entry.proto, "base64")));
    console.log("Last contract:", decodedContracts[decodedContracts.length-1]['identifier'])

    const customEggInfo = generateCustomEggInfo(decodedCustomEggs);
    const contractEggs = generateContractEggs(decodedContracts);

    fs.writeFileSync(
        path.join(OUTPUT_DIR, "custom_egg_info.json"),
        JSON.stringify(customEggInfo, null, 4)
    );

    fs.writeFileSync(
        path.join(OUTPUT_DIR, "colleggtible_contracts_eggs.json"),
        JSON.stringify(contractEggs, null, 4)
    );

    console.log("Files written successfully.");
}

main();
