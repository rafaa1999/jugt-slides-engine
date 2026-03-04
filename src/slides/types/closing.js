import { el, safeUrl } from "../../utils/dom.js";

export function renderClosing(slide) {
    const wrap = el("div", "slide-body slide-closing");

    const title = typeof slide.title === "string" ? slide.title : "Thanks!";
    const subtitle = typeof slide.subtitle === "string" ? slide.subtitle : "";

    wrap.appendChild(el("h2", "h2 h2--xl", { text: title }));
    if (subtitle) wrap.appendChild(el("p", "sub sub--lg", { text: subtitle }));

    const cta = slide.callToAction ?? {};
    if (typeof cta?.label === "string" && typeof cta?.url === "string" && cta.label.trim() && cta.url.trim()) {
        const a = el("a", "btn", { href: safeUrl(cta.url), target: "_blank", rel: "noreferrer" });
        a.appendChild(el("span", "btn__label", { text: cta.label }));
        wrap.appendChild(a);
    }

    return wrap;
}