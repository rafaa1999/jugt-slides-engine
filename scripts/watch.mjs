import chokidar from "chokidar";
import { spawn } from "node:child_process";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();

function log(msg) {
    process.stdout.write(`[watch] ${msg}\n`);
}

function runGenerate() {
    return new Promise((resolve, reject) => {
        const child = spawn(process.execPath, [path.join("scripts", "generate.mjs")], {
            cwd: ROOT,
            stdio: ["ignore", "pipe", "pipe"]
        });

        let stderr = "";
        child.stdout.on("data", (d) => process.stdout.write(d));
        child.stderr.on("data", (d) => {
            stderr += String(d);
            process.stderr.write(d);
        });

        child.on("close", (code) => {
            if (code === 0) resolve();
            else reject(new Error(stderr.trim() || `generate.mjs exited with code ${code}`));
        });
    });
}

function debounce(fn, waitMs) {
    let t = null;
    return () => {
        if (t) clearTimeout(t);
        t = setTimeout(() => {
            t = null;
            fn();
        }, waitMs);
    };
}

async function start() {

    await runGenerate().catch(() => { });

    const watchPaths = [
        path.join(ROOT, "talk.yml"),
        path.join(ROOT, "talk.json"),
        path.join(ROOT, "src", "presentation_java_9_25"),
        path.join(ROOT, "public", "assets")
    ];

    const trigger = debounce(async () => {
        await runGenerate().catch(() => {  });
    }, 150);

    const watcher = chokidar.watch(watchPaths, {
        ignoreInitial: true,
        awaitWriteFinish: {
            stabilityThreshold: 120,
            pollInterval: 50
        }
    });

    watcher.on("add", trigger);
    watcher.on("change", trigger);
    watcher.on("unlink", trigger);
    watcher.on("error", (err) => log(`Watcher error: ${err?.message ?? String(err)}`));

    log("Watching talk.yml/talk.json and /public/assets (debounced).");
}

start().catch((e) => {
    process.stderr.write(`[watch:error] ${e?.message ?? String(e)}\n`);
    process.exitCode = 1;
});