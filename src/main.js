import talk from "./generated/talk-data.json";
import { buildSlides, buildSponsorsStrip, applyBranding, applyTheme } from "./slides/render.js";

function showFatal(msg) {
    const fatal = document.getElementById("fatal");
    if (!fatal) return;
    fatal.classList.remove("hidden");
    fatal.textContent = msg;
}

function clearFatal() {
    const fatal = document.getElementById("fatal");
    if (!fatal) return;
    fatal.classList.add("hidden");
    fatal.textContent = "";
}

function ensureRevealAvailable() {
    if (!window.Reveal || typeof window.Reveal.initialize !== "function") {
        throw new Error("Reveal.js not loaded. Check CDN script tags in index.html.");
    }
}

function setOverlayMeta(talkData) {
    const titleEl = document.getElementById("deckTitle");
    const eventEl = document.getElementById("deckEvent");

    const rawTitle = talkData?.meta?.title?.trim();
    const event = talkData?.meta?.event?.trim();

    const title =
        (talkData?.meta?.shortTitle?.trim() || "") ||
        (rawTitle ? rawTitle.replace(/^JUGT:\s*/i, "").slice(0, 34) + (rawTitle.length > 34 ? "…" : "") : "");

    if (titleEl) {
        if (title) {
            titleEl.textContent = title;
            titleEl.classList.remove("hidden");
        } else {
            titleEl.textContent = "";
            titleEl.classList.add("hidden");
        }
    }

    if (eventEl) {
        if (event) {
            eventEl.textContent = event;
            eventEl.classList.remove("hidden");
        } else {
            eventEl.textContent = "";
            eventEl.classList.add("hidden");
        }
    }
}

function mount(talkData) {
    applyTheme(talkData);
    applyBranding(talkData);
    setOverlayMeta(talkData);

    const slidesRoot = document.getElementById("slides");
    if (!slidesRoot) throw new Error("Missing #slides container.");

    slidesRoot.innerHTML = "";
    slidesRoot.appendChild(buildSlides(talkData));

    const sponsorStrip = document.getElementById("sponsorStrip");
    if (sponsorStrip) {
        sponsorStrip.innerHTML = "";
        const strip = buildSponsorsStrip(talkData);
        sponsorStrip.appendChild(strip);

        if (!strip || strip.childNodes.length === 0) sponsorStrip.classList.add("hidden");
        else sponsorStrip.classList.remove("hidden");
    }
}

function applyActiveSlideAnimation() {
    const slides = document.querySelectorAll(".reveal .slides > section");
    slides.forEach((s) => s.classList.remove("jugt-animate"));

    const current = window.Reveal?.getCurrentSlide?.();
    if (current) {
        void current.offsetHeight; // restart CSS animations
        current.classList.add("jugt-animate");
    }
}

function moveGlowOnSlideChange() {
    const idx = window.Reveal?.getIndices?.() ?? { h: 0, v: 0 };

    const x = ((idx.h % 9) - 4) * 18;
    const y = ((idx.v % 7) - 3) * 14;

    document.documentElement.style.setProperty("--glow-x", `${x}px`);
    document.documentElement.style.setProperty("--glow-y", `${y}px`);

    const spd = 14 + ((idx.h + idx.v) % 5) * 2;
    document.documentElement.style.setProperty("--bytecode-speed", `${spd}s`);
}

function enableSpotlightAndTilt() {
    let raf = 0;
    let lx = 0.5;
    let ly = 0.45;

    const apply = () => {
        raf = 0;

        // spotlight
        document.documentElement.style.setProperty("--mx", `${(lx * 100).toFixed(2)}%`);
        document.documentElement.style.setProperty("--my", `${(ly * 100).toFixed(2)}%`);

        // tilt
        const tiltY = (lx - 0.5) * 6.5;
        const tiltX = (0.5 - ly) * 5.5;
        document.documentElement.style.setProperty("--tiltX", `${tiltX.toFixed(2)}deg`);
        document.documentElement.style.setProperty("--tiltY", `${tiltY.toFixed(2)}deg`);
    };

    const onMove = (clientX, clientY) => {
        lx = clientX / Math.max(1, window.innerWidth);
        ly = clientY / Math.max(1, window.innerHeight);
        if (!raf) raf = requestAnimationFrame(apply);
    };

    window.addEventListener("mousemove", (e) => onMove(e.clientX, e.clientY), { passive: true });

    window.addEventListener(
        "touchmove",
        (e) => {
            const t = e.touches?.[0];
            if (!t) return;
            onMove(t.clientX, t.clientY);
        },
        { passive: true }
    );
}

async function initReveal(talkData) {
    ensureRevealAvailable();

    await window.Reveal.initialize({
        hash: true,
        controls: true,
        progress: talkData?.theme?.showProgress === true,
        slideNumber: talkData?.theme?.slideNumber === true,
        center: false,
        transition: "slide",
        backgroundTransition: "fade",
        width: 1280,
        height: 720,
        margin: 0.06,
        plugins: [window.RevealHighlight]
    });

    window.Reveal.sync();

    enableSpotlightAndTilt();
    applyActiveSlideAnimation();
    moveGlowOnSlideChange();

    window.Reveal.on("slidechanged", () => {
        applyActiveSlideAnimation();
        moveGlowOnSlideChange();
    });

    window.Reveal.on("ready", () => {
        applyActiveSlideAnimation();
        moveGlowOnSlideChange();
    });
}

async function bootstrap() {
    try {
        clearFatal();
        mount(talk);
        await initReveal(talk);

        if (import.meta.hot) {
            import.meta.hot.accept("./generated/talk-data.json", async (mod) => {
                try {
                    const updated = mod?.default;
                    mount(updated);
                    window.Reveal.sync();
                    applyActiveSlideAnimation();
                    moveGlowOnSlideChange();
                } catch (e) {
                    showFatal(`[hot-reload error]\n${e?.message ?? String(e)}`);
                }
            });
        }
    } catch (e) {
        showFatal(`[startup error]\n${e?.message ?? String(e)}`);
    }
}

bootstrap();