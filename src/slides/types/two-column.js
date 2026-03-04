import { el } from "../../utils/dom.js";

function colBlock(data, fallbackHeading) {
    const box = el("div", "colbox");
    const heading = typeof data?.heading === "string" ? data.heading : fallbackHeading;
    box.appendChild(el("div", "colbox__heading", { text: heading }));

    const bullets = Array.isArray(data?.bullets) ? data.bullets : [];
    if (bullets.length > 0) {
        const ul = el("ul", "bullets");
        for (const b of bullets) {
            if (typeof b !== "string") continue;
            ul.appendChild(el("li", "bullets__item", { text: b }));
        }
        box.appendChild(ul);
    } else if (typeof data?.text === "string" && data.text.trim().length > 0) {
        box.appendChild(el("p", "p", { text: data.text }));
    }

    return box;
}

export function renderTwoColumn(slide) {
    const wrap = el("div", "slide-body");

    const title = typeof slide.title === "string" ? slide.title : "";
    if (title) wrap.appendChild(el("h2", "h2", { text: title }));

    const grid = el("div", "twocol");
    grid.appendChild(colBlock(slide.left, "Left"));
    grid.appendChild(colBlock(slide.right, "Right"));
    wrap.appendChild(grid);

    if (typeof slide.footer === "string" && slide.footer.trim().length > 0) {
        wrap.appendChild(el("div", "footer-note", { text: slide.footer }));
    }

    return wrap;
}