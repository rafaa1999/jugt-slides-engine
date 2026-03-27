import { el } from "../../utils/dom.js";

export function renderSection(slide) {
    const wrap = el("div", "slide-body slide-section");

    const title = typeof slide.title === "string" ? slide.title : "Section";
    const subtitle = typeof slide.subtitle === "string" ? slide.subtitle : "";
    const bullets = Array.isArray(slide.bullets) ? slide.bullets : [];
    const note = typeof slide.note === "string" ? slide.note : "";

    wrap.appendChild(el("div", "section-badge", { text: "Section" }));
    wrap.appendChild(el("h2", "h2 h2--xl", { text: title }));
    if (subtitle) wrap.appendChild(el("p", "sub sub--lg", { text: subtitle }));

    if (bullets.length > 0) {
        const ul = el("ul", "section-bullets");
        bullets.forEach(b => {
            const li = el("li", "section-bullet");
            li.textContent = typeof b === "string" ? b : "";
            ul.appendChild(li);
        });
        wrap.appendChild(ul);
    }

    if (note) wrap.appendChild(el("p", "section-note", { text: note }));

    return wrap;
}