// src/slides/render.js
// Pure DOM renderer: talk-data.json -> <section> slides for Reveal

function el(tag, className, attrs) {
    const n = document.createElement(tag);
    if (className) n.className = className;
    if (attrs) {
        for (const [k, v] of Object.entries(attrs)) {
            if (v === undefined || v === null) continue;
            if (k === "html") n.innerHTML = v;
            else if (k === "text") n.textContent = v;
            else n.setAttribute(k, String(v));
        }
    }
    return n;
}

function safeText(x) {
    return (x ?? "").toString();
}

function isNonEmptyStr(x) {
    return typeof x === "string" && x.trim().length > 0;
}

function defaultKickerForType(type) {
    switch (type) {
        case "title":
            return "Java • JVM • Community";
        case "agenda":
            return "Agenda";
        case "section":
            return "Module";
        case "two-column":
            return "Architecture";
        case "code":
            return "Code";
        case "image":
        case "video":
            return "Media";
        case "qr":
            return "Join";
        case "closing":
            return "Thanks";
        default:
            return "Slide";
    }
}

function buildSpeakerGrid(talkData) {
    const presenters = Array.isArray(talkData?.presenters) ? talkData.presenters : [];
    if (presenters.length === 0) return null;

    const grid = el("div", "speaker-grid" + (presenters.length === 1 ? " speaker-grid--one" : ""));
    for (const p of presenters) {
        const card = el("div", "speaker");

        let photoWrap = null;
        if (isNonEmptyStr(p.photo)) {
            photoWrap = el("div", "speaker__photo");
            const img = el("img", "speaker__img", { src: p.photo, alt: safeText(p.name) });
            img.onerror = () => {
                photoWrap.classList.add("speaker__photo--placeholder");
                photoWrap.innerHTML = `<div class="ph">No photo</div>`;
            };
            photoWrap.appendChild(img);
        }

        const meta = el("div", "speaker__metaWrap");
        const name = el("div", "speaker__name", { text: safeText(p.name) });

        const roleParts = [p.role, p.company].filter((x) => isNonEmptyStr(x));
        const role = el("div", "speaker__meta", { text: roleParts.join(" • ") });

        const socials = el("div", "speaker__socials");
        const socialsArr = Array.isArray(p.socials) ? p.socials : [];
        for (const s of socialsArr) {
            if (!isNonEmptyStr(s?.url) || !isNonEmptyStr(s?.label)) continue;
            const a = el("a", "chip", { href: s.url, target: "_blank", rel: "noreferrer", text: s.label });
            socials.appendChild(a);
        }

        meta.appendChild(name);
        meta.appendChild(role);
        if (socials.childNodes.length) meta.appendChild(socials);

        if (photoWrap) card.appendChild(photoWrap);
        card.appendChild(meta);
        grid.appendChild(card);
    }

    return grid;
}

function wrapSlide(body, type) {
    const section = el("section", "jugt-slide");
    section.dataset.type = type || "custom";
    section.appendChild(body);
    return section;
}

function slideShell({ kicker, title, subtitle, body }) {
    const shell = el("div", "slide-body");
    if (isNonEmptyStr(kicker)) shell.appendChild(el("div", "kicker", { text: kicker }));
    if (isNonEmptyStr(title)) shell.appendChild(el("h2", "h2", { text: title }));
    if (isNonEmptyStr(subtitle)) shell.appendChild(el("p", "sub", { text: subtitle }));
    if (body) shell.appendChild(body);
    return shell;
}

function buildTitleSlide(slide, talkData) {
    const body = el("div", "slide-body");

    // java signature pill
    body.appendChild(el("div", "pill", { text: ` ${safeText(talkData?.meta?.event || "JUGT")}` }));

    body.appendChild(el("h1", "h1", { text: safeText(slide.title || talkData?.meta?.title || "Untitled Talk") }));
    if (isNonEmptyStr(slide.subtitle)) body.appendChild(el("p", "sub sub--lg", { text: slide.subtitle }));

    const note = isNonEmptyStr(slide.note) ? el("div", "footer-note", { text: slide.note }) : null;
    if (note) body.appendChild(note);

    return wrapSlide(body, "title");
}

function buildAgendaSlide(slide) {
    const list = el("ol", "agenda");
    const items = Array.isArray(slide.items) ? slide.items : [];
    for (const it of items) list.appendChild(el("li", "agenda__item", { text: safeText(it) }));

    const shell = slideShell({
        kicker: slide.kicker || defaultKickerForType("agenda"),
        title: safeText(slide.title || "Agenda"),
        subtitle: "",
        body: list
    });

    return wrapSlide(shell, "agenda");
}

function buildSectionSlide(slide) {
    const shell = el("div", "slide-body");
    shell.appendChild(el("div", "section-badge", { text: safeText(slide.subtitle || "Module") }));
    shell.appendChild(el("h2", "h2 h2--xl", { text: safeText(slide.title || "Section") }));

    const bullets = Array.isArray(slide.bullets) ? slide.bullets : [];
    if (bullets.length > 0) {
        const ul = el("ul", "section-bullets");
        for (const b of bullets) {
            ul.appendChild(el("li", "section-bullet", { text: safeText(b) }));
        }
        shell.appendChild(ul);
    }

    if (isNonEmptyStr(slide.note)) {
        shell.appendChild(el("p", "section-note", { text: slide.note }));
    }

    return wrapSlide(shell, "section");
}

function buildTwoColumnSlide(slide) {
    const grid = el("div", "twocol");

    const left = el("div", "colbox");
    left.appendChild(el("div", "colbox__heading", { text: safeText(slide?.left?.heading || "Left") }));
    const lb = el("ul", "bullets");
    for (const b of Array.isArray(slide?.left?.bullets) ? slide.left.bullets : []) {
        lb.appendChild(el("li", "bullets__item", { text: safeText(b) }));
    }
    left.appendChild(lb);

    const right = el("div", "colbox");
    right.appendChild(el("div", "colbox__heading", { text: safeText(slide?.right?.heading || "Right") }));
    const rb = el("ul", "bullets");
    for (const b of Array.isArray(slide?.right?.bullets) ? slide.right.bullets : []) {
        rb.appendChild(el("li", "bullets__item", { text: safeText(b) }));
    }
    right.appendChild(rb);

    grid.appendChild(left);
    grid.appendChild(right);

    const shell = slideShell({
        kicker: slide.kicker || defaultKickerForType("two-column"),
        title: safeText(slide.title || "Two Column"),
        subtitle: slide.subtitle || "",
        body: grid
    });

    return wrapSlide(shell, "two-column");
}

function buildCodeSlide(slide) {
    const pre = el("pre", slide.compact ? "codeframe codeframe--compact" : "codeframe");
    const code = el("code", "", { text: safeText(slide.code || "") });
    if (isNonEmptyStr(slide.language)) code.className = `language-${slide.language}`;
    pre.appendChild(code);

    const shell = slideShell({
        kicker: slide.kicker || defaultKickerForType("code"),
        title: safeText(slide.title || "Code"),
        subtitle: slide.caption || "",
        body: pre
    });

    return wrapSlide(shell, "code");
}

function buildCodeCompareSlide(slide) {
    const grid = el("div", "codecompare");

    for (const side of ["left", "right"]) {
        const col = slide[side] || {};
        const col_el = el("div", "codecompare__col");

        if (isNonEmptyStr(col.title)) {
            col_el.appendChild(el("div", "codecompare__label", { text: col.title }));
        }

        const pre = el("pre", "codeframe codeframe--compact");
        const code = el("code", "", { text: safeText(col.code || "") });
        if (isNonEmptyStr(col.language)) code.className = `language-${col.language}`;
        pre.appendChild(code);
        col_el.appendChild(pre);

        if (isNonEmptyStr(col.caption)) {
            col_el.appendChild(el("p", "sub", { text: col.caption }));
        }

        grid.appendChild(col_el);
    }

    const shell = slideShell({
        kicker: slide.kicker || defaultKickerForType("code"),
        title: safeText(slide.title || ""),
        subtitle: slide.subtitle || "",
        body: grid
    });

    return wrapSlide(shell, "code-compare");
}

function buildImageSlide(slide) {
    const frame = el("div", "mediaframe");

    if (isNonEmptyStr(slide.src)) {
        const img = el("img", "mediaframe__img", { src: slide.src, alt: safeText(slide.alt || "Image") });
        img.onerror = () => {
            frame.innerHTML = "";
            frame.appendChild(
                el("div", "placeholder", { html: `<b>Missing image</b><div class="hint">${safeText(slide.src)}</div>` })
            );
        };
        frame.appendChild(img);
    } else {
        frame.appendChild(
            el("div", "placeholder", { html: `<b>No image provided</b><div class="hint">Add <code>src</code> in YAML.</div>` })
        );
    }

    const shell = slideShell({
        kicker: slide.kicker || defaultKickerForType("image"),
        title: safeText(slide.title || "Image"),
        subtitle: slide.caption || "",
        body: frame
    });

    return wrapSlide(shell, "image");
}

function buildVideoSlide(slide) {
    const frame = el("div", "mediaframe");

    if (slide.mode === "youtube" && isNonEmptyStr(slide.youtubeId)) {
        const src = `https://www.youtube.com/embed/${slide.youtubeId}?rel=0&modestbranding=1&playsinline=1`;
        const iframe = el("iframe", "mediaframe__iframe", {
            src,
            title: safeText(slide.title || "YouTube video"),
            allow:
                "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share",
            allowfullscreen: "true"
        });
        frame.appendChild(iframe);
    } else if (slide.mode === "mp4" && isNonEmptyStr(slide.src)) {
        const v = el("video", "mediaframe__video", { controls: "true", playsinline: "true" });
        const s = el("source", "", { src: slide.src, type: "video/mp4" });
        v.appendChild(s);

        v.addEventListener("error", () => {
            frame.innerHTML = "";
            frame.appendChild(
                el("div", "placeholder", { html: `<b>Missing video</b><div class="hint">${safeText(slide.src)}</div>` })
            );
        });

        frame.appendChild(v);
    } else {
        frame.appendChild(
            el("div", "placeholder", {
                html: `<b>No video configured</b><div class="hint">Set <code>mode</code> + <code>youtubeId</code> or <code>src</code> in YAML.</div>`
            })
        );
    }

    const shell = slideShell({
        kicker: slide.kicker || defaultKickerForType("video"),
        title: safeText(slide.title || "Video"),
        subtitle: slide.caption || "",
        body: frame
    });

    return wrapSlide(shell, "video");
}

function buildQrSlide(slide) {
    const grid = el("div", "qrgrid");

    const box = el("div", "qrbox");
    box.appendChild(el("div", "placeholder", { html: `<b>QR slide</b><div class="hint">Keep your QR renderer here.</div>` }));

    const meta = el("div", "qrmeta");
    meta.appendChild(el("div", "kicker", { text: safeText(slide.subtitle || defaultKickerForType("qr")) }));
    meta.appendChild(el("h2", "h2", { text: safeText(slide.title || "Join JUGT") }));

    if (isNonEmptyStr(slide.url)) {
        meta.appendChild(el("a", "qrmeta__link", { href: slide.url, target: "_blank", rel: "noreferrer", text: slide.url }));
    }
    if (isNonEmptyStr(slide.hint)) meta.appendChild(el("p", "sub", { text: slide.hint }));

    grid.appendChild(box);
    grid.appendChild(meta);

    const shell = el("div", "slide-body");
    shell.appendChild(grid);
    return wrapSlide(shell, "qr");
}

function buildClosingSlide(slide) {
    const body = el("div", "slide-body");
    body.appendChild(el("div", "pill", { text: "JUGT • Java Community" }));
    body.appendChild(el("h2", "h2 h2--xl", { text: safeText(slide.title || "Thanks!") }));
    if (isNonEmptyStr(slide.subtitle)) body.appendChild(el("p", "sub sub--lg", { text: slide.subtitle }));

    if (slide?.callToAction?.url && slide?.callToAction?.label) {
        body.appendChild(
            el("a", "chip", { href: slide.callToAction.url, target: "_blank", rel: "noreferrer", text: slide.callToAction.label })
        );
    }

    return wrapSlide(body, "closing");
}

function buildCustomFallbackSlide(slide) {
    const pre = el("pre", "codeframe");
    pre.appendChild(el("code", "language-json", { text: JSON.stringify(slide, null, 2) }));

    const shell = slideShell({
        kicker: "Unsupported slide type",
        title: safeText(slide?.type || "custom"),
        subtitle: "This slide type is not implemented. Showing raw JSON.",
        body: pre
    });

    return wrapSlide(shell, "custom");
}

export function buildSlides(talkData) {
    const frag = document.createDocumentFragment();
    const slides = Array.isArray(talkData?.slides) ? talkData.slides : [];

    for (const slide of slides) {
        const type = safeText(slide?.type || "custom");

        let section;
        if (type === "title") {
            const wrap = document.createDocumentFragment();
            if (slide.showPresenters === true) {
                const grid = buildSpeakerGrid(talkData);
                if (grid) wrap.appendChild(grid);
            }
            const titleSection = buildTitleSlide(slide, talkData);

            if (wrap.childNodes.length) {
                const container = el("section", "jugt-slide");
                container.dataset.type = "title";
                for (const n of Array.from(wrap.childNodes)) container.appendChild(n);
                container.appendChild(titleSection.firstChild);
                section = container;
            } else {
                section = titleSection;
            }
        } else if (type === "agenda") section = buildAgendaSlide(slide);
        else if (type === "section") section = buildSectionSlide(slide);
        else if (type === "two-column") section = buildTwoColumnSlide(slide);
        else if (type === "code") section = buildCodeSlide(slide);
        else if (type === "code-compare") section = buildCodeCompareSlide(slide);
        else if (type === "image") section = buildImageSlide(slide);
        else if (type === "video") section = buildVideoSlide(slide);
        else if (type === "qr") section = buildQrSlide(slide);
        else if (type === "closing") section = buildClosingSlide(slide);
        else section = buildCustomFallbackSlide(slide);

        frag.appendChild(section);
    }

    return frag;
}

export function buildSponsorsStrip(talkData) {
    const sponsors = Array.isArray(talkData?.sponsors) ? talkData.sponsors : [];
    if (!sponsors.length) return document.createDocumentFragment();

    const wrap = el("div", "sponsor-strip__wrap");
    const track = el("div", "sponsor-strip__track");

    const normalized = sponsors
        .filter((s) => s && (isNonEmptyStr(s.name) || isNonEmptyStr(s.logo)))
        .map((s) => ({
            name: safeText(s.name || "Sponsor"),
            tier: safeText(s.tier || ""),
            url: safeText(s.url || ""),
            logo: safeText(s.logo || "")
        }));

    const buildOne = () => {
        for (const s of normalized) {
            const a = el("a", "sponsor", { href: s.url || "#", target: "_blank", rel: "noreferrer" });

            if (isNonEmptyStr(s.logo)) {
                const img = el("img", "sponsor__logo", { src: s.logo, alt: s.name });
                img.onerror = () => {
                    a.classList.add("sponsor--text");
                    a.innerHTML = "";
                    a.appendChild(el("span", "sponsor__name", { text: s.name }));
                    if (isNonEmptyStr(s.tier)) a.appendChild(el("span", "sponsor__tier", { text: s.tier }));
                };
                a.appendChild(img);
            } else {
                a.classList.add("sponsor--text");
                a.appendChild(el("span", "sponsor__name", { text: s.name }));
                if (isNonEmptyStr(s.tier)) a.appendChild(el("span", "sponsor__tier", { text: s.tier }));
            }

            track.appendChild(a);
        }
    };

    buildOne();
    buildOne();
    wrap.appendChild(track);
    return wrap;
}

export function applyBranding(talkData) {
    const logo = document.getElementById("jugtLogo");
    const path = talkData?.branding?.jugtLogo;

    if (!logo) return;

    if (isNonEmptyStr(path)) {
        logo.classList.remove("hidden");
        logo.src = path;
        logo.onerror = () => logo.classList.add("hidden");
    } else {
        logo.classList.add("hidden");
        logo.removeAttribute("src");
    }
}

export function applyTheme(talkData) {
    const accent = talkData?.theme?.accentColor;
    if (isNonEmptyStr(accent)) {
        document.documentElement.style.setProperty("--accent", accent);
    }
}