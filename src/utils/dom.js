export function el(tag, className = "", attrs = {}) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    for (const [k, v] of Object.entries(attrs)) {
        if (v === undefined || v === null) continue;
        if (k === "text") node.textContent = String(v);
        else if (k === "html") node.innerHTML = String(v);
        else node.setAttribute(k, String(v));
    }
    return node;
}

export function safeUrl(url) {
    if (typeof url !== "string") return "";
    // allow only http(s) or root-relative
    if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("/")) return url;
    return "";
}

export function isNonEmptyString(v) {
    return typeof v === "string" && v.trim().length > 0;
}