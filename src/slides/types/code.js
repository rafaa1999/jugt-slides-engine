import { el } from "../../utils/dom.js";

export function renderCode(slide) {
    const wrap = el("div", "slide-body");

    const title = typeof slide.title === "string" ? slide.title : "";
    if (title) wrap.appendChild(el("h2", "h2", { text: title }));

    const lang = typeof slide.language === "string" ? slide.language : "text";
    const code = typeof slide.code === "string" ? slide.code : "";

    const pre = el("pre", "codeframe");
    const codeEl = el("code", `language-${lang}`);
    codeEl.textContent = code || "// (no code provided)";
    pre.appendChild(codeEl);

    wrap.appendChild(pre);

    const caption = typeof slide.caption === "string" ? slide.caption : "";
    if (caption) wrap.appendChild(el("div", "caption", { text: caption }));

    return wrap;
}