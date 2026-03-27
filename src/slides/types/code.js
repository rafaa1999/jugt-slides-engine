import { el } from "../../utils/dom.js";

export function renderCode(slide) {
    const wrap = el("div", "slide-body slide-code");

    const title = typeof slide.title === "string" ? slide.title : "";
    if (title) wrap.appendChild(el("h2", "h2", { text: title }));

    const lang = typeof slide.language === "string" ? slide.language : "text";
    const code = typeof slide.code === "string" ? slide.code : "";

    const pre = el("pre", slide.compact ? "codeframe codeframe--compact" : "codeframe");
    const codeEl = el("code", `language-${lang}`);
    codeEl.textContent = code || "// (no code provided)";
    pre.appendChild(codeEl);

    wrap.appendChild(pre);

    const caption = typeof slide.caption === "string" ? slide.caption : "";
    if (caption) wrap.appendChild(el("div", "caption", { text: caption }));

    const note = typeof slide.note === "string" ? slide.note : "";
    if (note) wrap.appendChild(el("div", "code-note", { text: note }));

    return wrap;
}