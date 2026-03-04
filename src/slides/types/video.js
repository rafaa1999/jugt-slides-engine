import { el, safeUrl } from "../../utils/dom.js";

export function renderVideo(slide) {
    const wrap = el("div", "slide-body");

    const title = typeof slide.title === "string" ? slide.title : "";
    if (title) wrap.appendChild(el("h2", "h2", { text: title }));

    const mode = typeof slide.mode === "string" ? slide.mode : "youtube";
    const frame = el("div", "mediaframe");

    if (mode === "youtube") {
        const id = typeof slide.youtubeId === "string" ? slide.youtubeId.trim() : "";
        if (id) {
            const start = Number.isFinite(Number(slide.startSeconds)) ? Number(slide.startSeconds) : 0;
            const url = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?rel=0&modestbranding=1&start=${Math.max(0, start)}`;

            const iframe = el("iframe", "mediaframe__iframe", {
                src: url,
                title: "YouTube video",
                allow:
                    "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
                allowfullscreen: "true"
            });

            frame.appendChild(iframe);
        } else {
            frame.appendChild(el("div", "placeholder", { text: "YouTube video not configured" }));
            frame.appendChild(el("div", "hint", { text: "Add slides[].youtubeId in talk.yml" }));
        }
    } else if (mode === "mp4") {
        const src = safeUrl(slide?.src ?? "");
        if (src) {
            const video = el("video", "mediaframe__video", { controls: "true" });
            video.src = src;
            video.onloadeddata = () => {};
            video.onerror = () => {
                video.remove();
                frame.appendChild(el("div", "placeholder", { text: "MP4 missing" }));
            };
            frame.appendChild(video);
        } else {
            frame.appendChild(el("div", "placeholder", { text: "MP4 source not configured" }));
            frame.appendChild(el("div", "hint", { text: "Set slides[].src and mode: mp4" }));
        }
    } else {
        frame.appendChild(el("div", "placeholder", { text: `Unknown video mode: ${mode}` }));
    }

    wrap.appendChild(frame);

    const caption = typeof slide.caption === "string" ? slide.caption : "";
    if (caption) wrap.appendChild(el("div", "caption", { text: caption }));

    return wrap;
}