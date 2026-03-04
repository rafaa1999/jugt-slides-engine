import { el } from "../../utils/dom.js";

export function renderSection(slide) {
    const wrap = el("div", "slide-body slide-section");

    const title = typeof slide.title === "string" ? slide.title : "Section";
    const subtitle = typeof slide.subtitle === "string" ? slide.subtitle : "";

    wrap.appendChild(el("div", "section-badge", { text: "Section" }));
    wrap.appendChild(el("h2", "h2 h2--xl", { text: title }));
    if (subtitle) wrap.appendChild(el("p", "sub sub--lg", { text: subtitle }));

    return wrap;
}