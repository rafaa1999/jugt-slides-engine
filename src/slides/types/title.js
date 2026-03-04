import { el } from "../../utils/dom.js";

export function renderTitle(slide, talk) {
    const wrap = el("div", "slide-body slide-title");

    const t = typeof slide.title === "string" ? slide.title : (talk?.meta?.title ?? "Untitled");
    const st = typeof slide.subtitle === "string" ? slide.subtitle : "";
    const eventLineParts = [
        talk?.meta?.event || "",
        talk?.meta?.venue || "",
        talk?.meta?.date || ""
    ].filter((x) => typeof x === "string" && x.trim().length > 0);

    wrap.appendChild(el("div", "kicker", { text: eventLineParts.join(" • ") }));
    wrap.appendChild(el("h1", "h1", { text: t }));
    if (st) wrap.appendChild(el("p", "sub", { text: st }));

    return wrap;
}