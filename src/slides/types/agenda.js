import { el } from "../../utils/dom.js";

export function renderAgenda(slide) {
    const wrap = el("div", "slide-body");

    const title = typeof slide.title === "string" ? slide.title : "Agenda";
    wrap.appendChild(el("h2", "h2", { text: title }));

    const items = Array.isArray(slide.items) ? slide.items : [];
    const list = el("ol", "agenda");
    for (const it of items) {
        if (typeof it !== "string") continue;
        list.appendChild(el("li", "agenda__item", { text: it }));
    }
    wrap.appendChild(list);

    return wrap;
}