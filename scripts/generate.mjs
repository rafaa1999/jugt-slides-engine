import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import yaml from "js-yaml";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");
const GENERATED_DIR = path.join(SRC_DIR, "generated");
const GENERATED_FILE = path.join(GENERATED_DIR, "talk-data.json");

const TALK_YAML = path.join(ROOT, "talk.yml");
const TALK_JSON = path.join(ROOT, "talk.json");

const PUBLIC_DIR = path.join(ROOT, "public");

function nowIso() {
    return new Date().toISOString();
}

function logInfo(msg) {
    process.stdout.write(`[gen] ${msg}\n`);
}

function logWarn(msg) {
    process.stdout.write(`[gen:warn] ${msg}\n`);
}

function logError(msg) {
    process.stderr.write(`[gen:error] ${msg}\n`);
}

function safeRead(filePath) {
    try {
        return fs.readFileSync(filePath, "utf8");
    } catch {
        return null;
    }
}

function fileExists(absPath) {
    try {
        fs.accessSync(absPath, fs.constants.F_OK);
        return true;
    } catch {
        return false;
    }
}

function toPublicAbs(assetUrl) {
    // assetUrl expected like "/assets/x.png"
    if (typeof assetUrl !== "string" || !assetUrl.startsWith("/")) return null;
    return path.join(PUBLIC_DIR, assetUrl.replace(/^\//, ""));
}

function normalizeString(v, fallback = "") {
    return typeof v === "string" ? v : fallback;
}

function normalizeBool(v, fallback = false) {
    return typeof v === "boolean" ? v : fallback;
}

function normalizeArray(v) {
    return Array.isArray(v) ? v : [];
}

function requiredObject(v, name) {
    if (!v || typeof v !== "object" || Array.isArray(v)) {
        throw new Error(`Expected "${name}" to be an object.`);
    }
    return v;
}

function resolveIncludes(slides, baseDir) {
    const result = [];
    for (const slide of slides) {
        if (slide && typeof slide.$include === "string") {
            const includePath = path.resolve(baseDir, slide.$include);
            const raw = safeRead(includePath);
            if (!raw) {
                logWarn(`$include not found: ${includePath}`);
                continue;
            }
            let included;
            try {
                included = yaml.load(raw);
            } catch (e) {
                throw new Error(`Failed to parse included file ${includePath}: ${e?.message ?? String(e)}`);
            }
            if (included && Array.isArray(included.slides)) {
                result.push(...resolveIncludes(included.slides, path.dirname(includePath)));
            }
        } else {
            result.push(slide);
        }
    }
    return result;
}

function loadTalk() {
    const yamlRaw = safeRead(TALK_YAML);
    const jsonRaw = safeRead(TALK_JSON);

    if (!yamlRaw && !jsonRaw) {
        throw new Error(`Missing talk.yml (or talk.json). Create talk.yml in project root.`);
    }

    let source = "talk.yml";
    let doc;

    try {
        if (yamlRaw) {
            doc = yaml.load(yamlRaw);
            source = "talk.yml";
        } else {
            doc = JSON.parse(jsonRaw);
            source = "talk.json";
        }
    } catch (e) {
        throw new Error(`Failed to parse ${source}: ${e?.message ?? String(e)}`);
    }

    requiredObject(doc, "root");
    return { source, doc };
}

function validateAndEnrich(doc) {
    const meta = requiredObject(doc.meta ?? {}, "meta");
    const theme = requiredObject(doc.theme ?? {}, "theme");
    const branding = requiredObject(doc.branding ?? {}, "branding");

    const presenters = normalizeArray(doc.presenters);
    const sponsors = normalizeArray(doc.sponsors);
    const slides = resolveIncludes(normalizeArray(doc.slides), ROOT);

    const out = {
        _generatedAt: nowIso(),
        meta: {
            title: normalizeString(meta.title, "Untitled Talk"),
            event: normalizeString(meta.event, ""),
            date: normalizeString(meta.date, ""),
            venue: normalizeString(meta.venue, ""),
            language: normalizeString(meta.language, "en")
        },
        theme: {
            accentColor: normalizeString(theme.accentColor, "#7C5CFF"),
            glass: normalizeBool(theme.glass, true),
            backgroundVariant: normalizeString(theme.backgroundVariant, "aurora"),
            slideNumber: normalizeBool(theme.slideNumber, true),
            showProgress: normalizeBool(theme.showProgress, true)
        },
        branding: {
            jugtLogo: normalizeString(branding.jugtLogo, "")
        },
        presenters: presenters.map((p, idx) => {
            const po = requiredObject(p ?? {}, `presenters[${idx}]`);
            const socials = normalizeArray(po.socials).map((s, sidx) => {
                const so = requiredObject(s ?? {}, `presenters[${idx}].socials[${sidx}]`);
                return {
                    label: normalizeString(so.label, ""),
                    url: normalizeString(so.url, "")
                };
            });

            return {
                name: normalizeString(po.name, `Presenter ${idx + 1}`),
                role: normalizeString(po.role, ""),
                company: normalizeString(po.company, ""),
                photo: normalizeString(po.photo, ""),
                socials
            };
        }),
        sponsors: sponsors.map((s, idx) => {
            const so = requiredObject(s ?? {}, `sponsors[${idx}]`);
            return {
                name: normalizeString(so.name, `Sponsor ${idx + 1}`),
                tier: normalizeString(so.tier, "Partner"),
                logo: normalizeString(so.logo, ""),
                url: normalizeString(so.url, "")
            };
        }),
        slides: slides.map((sl, idx) => {
            const so = requiredObject(sl ?? {}, `slides[${idx}]`);
            const type = normalizeString(so.type, "custom");
            return { ...so, type };
        }),
        assets: {
            missing: [],
            present: []
        }
    };

    const assetRefs = [];

    if (out.branding.jugtLogo) assetRefs.push({ kind: "branding.jugtLogo", url: out.branding.jugtLogo });

    out.presenters.forEach((p, i) => {
        if (p.photo) assetRefs.push({ kind: `presenters[${i}].photo`, url: p.photo });
    });

    out.sponsors.forEach((s, i) => {
        if (s.logo) assetRefs.push({ kind: `sponsors[${i}].logo`, url: s.logo });
    });

    out.slides.forEach((sl, i) => {
        if (sl.type === "image" && typeof sl.src === "string" && sl.src) {
            assetRefs.push({ kind: `slides[${i}].src`, url: sl.src });
        }
        if (sl.type === "video" && sl.mode === "mp4" && typeof sl.src === "string" && sl.src) {
            assetRefs.push({ kind: `slides[${i}].src`, url: sl.src });
        }
    });

    for (const ref of assetRefs) {
        const abs = toPublicAbs(ref.url);
        if (!abs) {
            out.assets.missing.push({ ...ref, reason: "invalid-path" });
            continue;
        }
        if (fileExists(abs)) out.assets.present.push(ref);
        else out.assets.missing.push({ ...ref, reason: "not-found" });
    }

    if (out.assets.missing.length > 0) {
        logWarn(`Missing assets detected: ${out.assets.missing.length}. UI will render placeholders.`);
    }

    if (out.slides.length === 0) {
        out.slides.push({
            type: "title",
            title: out.meta.title,
            subtitle: out.meta.event || "JUGT",
            showPresenters: true
        });
        logWarn("No slides found. Added a default title slide.");
    }

    return out;
}

function ensureDir(dir) {
    fs.mkdirSync(dir, { recursive: true });
}

function atomicWrite(filePath, content) {
    const tmp = `${filePath}.tmp`;
    fs.writeFileSync(tmp, content, "utf8");
    fs.renameSync(tmp, filePath);
}

function main() {
    const args = new Set(process.argv.slice(2));
    const prod = args.has("--prod");

    try {
        const { source, doc } = loadTalk();
        const payload = validateAndEnrich(doc);

        ensureDir(GENERATED_DIR);
        atomicWrite(GENERATED_FILE, JSON.stringify(payload, null, 2));

        if (!prod) {
            logInfo(`Generated ${path.relative(ROOT, GENERATED_FILE)} from ${source}`);
        } else {
            logInfo(`Generated for production: ${path.relative(ROOT, GENERATED_FILE)}`);
        }
    } catch (e) {
        logError(e?.message ?? String(e));
        process.exitCode = 1;
    }
}

main();