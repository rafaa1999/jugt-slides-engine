import { el } from "../../utils/dom.js";
import QRCode from "qrcode";

export function renderQr(slide) {
    const wrap = el("div", "slide-body");

    const title = typeof slide.title === "string" ? slide.title : "QR";
    const subtitle = typeof slide.subtitle === "string" ? slide.subtitle : "";
    const url = typeof slide.url === "string" ? slide.url.trim() : "";

    wrap.appendChild(el("h2", "h2", { text: title }));
    if (subtitle) wrap.appendChild(el("p", "sub", { text: subtitle }));

    const grid = el("div", "qrgrid");

    const card = el("div", "qrbox");
    const canvas = el("canvas", "qrbox__canvas");
    card.appendChild(canvas);

    const right = el("div", "qrmeta");
    if (url) {
        right.appendChild(el("div", "qrmeta__label", { text: "Link" }));
        const a = el("a", "qrmeta__link", { href: url, target: "_blank", rel: "noreferrer", text: url });
        right.appendChild(a);
    } else {
        right.appendChild(el("div", "placeholder", { text: "No URL configured for QR" }));
    }

    const hint = typeof slide.hint === "string" ? slide.hint : "";
    if (hint) right.appendChild(el("div", "hint", { text: hint }));

    grid.appendChild(card);
    grid.appendChild(right);
    wrap.appendChild(grid);


    queueMicrotask(async () => {
        if (!url) return;
        try {
            await QRCode.toCanvas(canvas, url, {
                errorCorrectionLevel: "M",
                margin: 1,
                scale: 7
            });
        } catch {
            card.innerHTML = "";
            card.appendChild(el("div", "placeholder", { text: "Failed to render QR" }));
        }
    });

    return wrap;
}