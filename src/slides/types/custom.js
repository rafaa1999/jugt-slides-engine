import { el } from "../../utils/dom.js";

export function renderCustom(slide) {
    const wrap = el("div", "slide-body");

    const type = typeof slide.type === "string" ? slide.type : "custom";
    wrap.appendChild(el("div", "pill", { text: `Custom Slide (${type})` }));

    const title = typeof slide.title === "string" ? slide.title : "";
    if (title) wrap.appendChild(el("h2", "h2", { text: title }));

    const hint = el("div", "hint", {
        text: "No renderer found for this slide type. Add a renderer under src/slides/types and register it."
    });
    wrap.appendChild(hint);

    const pre = el("pre", "codeframe");
    const code = el("code", "language-json");
    code.textContent = JSON.stringify(slide, null, 2);
    pre.appendChild(code);
    wrap.appendChild(pre);

    return wrap;
}