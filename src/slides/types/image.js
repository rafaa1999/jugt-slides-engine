import { el, safeUrl } from "../../utils/dom.js";

export function renderImage(slide) {
    const wrap = el("div", "slide-body");

    const title = typeof slide.title === "string" ? slide.title : "";
    if (title) wrap.appendChild(el("h2", "h2", { text: title }));

    const frame = el("div", "mediaframe");

    const src = safeUrl(slide?.src ?? "");
    const alt = typeof slide.alt === "string" ? slide.alt : "Image";

    if (src) {
        const img = el("img", "mediaframe__img", { alt });
        img.src = src;
        img.loading = "lazy";
        img.onerror = () => {
            img.remove();
            frame.appendChild(el("div", "placeholder", { text: "Image missing" }));
        };
        frame.appendChild(img);
    } else {
        frame.appendChild(el("div", "placeholder", { text: "No image provided" }));
    }

    wrap.appendChild(frame);

    const caption = typeof slide.caption === "string" ? slide.caption : "";
    if (caption) wrap.appendChild(el("div", "caption", { text: caption }));

    return wrap;
}