export function normalizeAssetUrl(url) {
    if (typeof url !== "string") return "";
    return url.trim();
}