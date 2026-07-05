/* Hero driver — "Compile the Draft" (ported from the handoff Hero Prototype).
   The boot inline script decides .play vs .done before first paint; CSS owns
   every keyframe/delay. This module owns: grid-line generation, honest
   measurement (ruler px / name size / ink hex), the rAF counters, the
   interactive terminal, the crosshair, and replay. */

const hero = document.getElementById("hero");

if (hero) {
    const $ = <T extends HTMLElement>(sel: string) => hero.querySelector<T>(sel);
    const grid = $("[data-hero-grid]");
    const dimEl = $("[data-dim]");
    const dimRuler = $("[data-dim-ruler]");
    const draftedEl = $("[data-drafted]");
    const nameEl = $("[data-hero-name]");
    const nameSizeEl = $("[data-name-size]");
    const nameLhEl = $("[data-name-lh]");
    const inkHexEl = $("[data-ink-hex]");
    const termLog = $("[data-term-log]");
    const termExtra = $("[data-term-extra]");
    const termTyped = $("[data-term-typed]");
    const termHint = $("[data-term-hint]");
    const termInput = $<HTMLInputElement>("[data-term-input]");
    const terminal = $("[data-terminal]");
    const coords = $("[data-coords]");
    const crossV = $("[data-cross-v]");
    const crossH = $("[data-cross-h]");
    const crossChip = $("[data-cross-chip]");

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DRAFTED = 6.2;
    let dimTarget = 760;
    let rafId = 0;

    /* ---------- honest measurement ---------- */

    const toHex = (rgb: string): string => {
        const m = rgb.match(/\d+/g);
        if (!m || m.length < 3) return rgb;
        return (
            "#" +
            m
                .slice(0, 3)
                .map((n) => (+n).toString(16).padStart(2, "0"))
                .join("")
                .toUpperCase()
        );
    };

    const measure = () => {
        if (dimRuler) dimTarget = Math.round(dimRuler.getBoundingClientRect().width) || dimTarget;
        if (nameEl) {
            const cs = getComputedStyle(nameEl);
            const size = Math.round(parseFloat(cs.fontSize));
            if (nameSizeEl && size) nameSizeEl.textContent = String(size);
            const lh = parseFloat(cs.lineHeight);
            if (nameLhEl && size && !Number.isNaN(lh)) {
                nameLhEl.textContent = (lh / size).toFixed(2).replace(/0$/, "");
            }
            if (inkHexEl) inkHexEl.textContent = toHex(cs.color);
        }
        if (hero.classList.contains("done") && dimEl) dimEl.textContent = String(dimTarget);
    };

    // Ink hex tracks the theme (the callout quotes the live --ink value).
    new MutationObserver(measure).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme"],
    });

    /* ---------- drafting grid, line by line ---------- */

    const buildGrid = () => {
        if (!grid) return;
        const cell = parseFloat(getComputedStyle(hero).getPropertyValue("--space-grid")) || 56;
        const { width, height } = hero.getBoundingClientRect();
        const frag = document.createDocumentFragment();
        const vCount = Math.floor(width / cell);
        const hCount = Math.floor(height / cell);
        for (let i = 0; i < vCount; i++) {
            const line = document.createElement("div");
            line.className = "grid-line v";
            line.style.left = `${(i + 1) * cell}px`;
            line.style.setProperty("--i", String(i));
            frag.append(line);
        }
        for (let j = 0; j < hCount; j++) {
            const line = document.createElement("div");
            line.className = "grid-line h";
            line.style.top = `${(j + 1) * cell}px`;
            line.style.setProperty("--i", String(j));
            frag.append(line);
        }
        grid.replaceChildren(frag);
    };

    /* ---------- rAF timeline (counters + completion) ---------- */

    const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);
    const window01 = (t: number, from: number, to: number) =>
        Math.min(1, Math.max(0, (t - from) / (to - from)));

    const settle = () => {
        hero.classList.remove("play");
        hero.classList.add("done");
        if (dimEl) dimEl.textContent = String(dimTarget);
        if (draftedEl) draftedEl.textContent = DRAFTED.toFixed(1);
    };

    const startTimeline = () => {
        cancelAnimationFrame(rafId);
        const t0 = performance.now();
        const tick = (now: number) => {
            const t = (now - t0) / 1000;
            if (dimEl && t >= 4.4) {
                dimEl.textContent = String(Math.round(dimTarget * easeOut(window01(t, 4.4, 5.2))));
            }
            if (draftedEl && t >= 7.2) {
                draftedEl.textContent = (DRAFTED * easeOut(window01(t, 7.2, 7.8))).toFixed(1);
            }
            if (t >= 8.1) {
                settle();
                return;
            }
            rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);
    };

    /* ---------- replay ---------- */

    const replay = () => {
        if (reduced) return; // settled is the design under reduced motion
        cancelAnimationFrame(rafId);
        clearTerminal();
        hero.classList.remove("play", "done");
        buildGrid();
        // Force a reflow so re-adding .play restarts every CSS animation.
        void hero.offsetWidth;
        hero.classList.add("play");
        try {
            sessionStorage.setItem("introPlayed", "1");
        } catch {
            /* ignore */
        }
        startTimeline();
    };

    window.addEventListener("compile:replay", replay);
    document.addEventListener("keydown", (e) => {
        if (e.key !== "r" && e.key !== "R") return;
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        const t = e.target as HTMLElement;
        if (t.closest("input, textarea, select, [contenteditable]")) return;
        // Per the handoff (and to tame the single-key shortcut), R only
        // replays while the hero is actually in view.
        const rect = hero.getBoundingClientRect();
        if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;
        replay();
    });

    /* ---------- interactive terminal ---------- */

    const MAX_LINES = 8;
    const staticLines = termLog
        ? ([...termLog.children] as HTMLElement[]).filter((el) => el.matches(".term-line, .term-drafted"))
        : [];
    let extraLines: HTMLElement[] = [];

    const trimBuffer = () => {
        const visibleStatic = staticLines.filter((el) => !el.style.display);
        const overflow = visibleStatic.length + extraLines.length - MAX_LINES;
        for (let i = 0; i < overflow && i < visibleStatic.length; i++) {
            visibleStatic[i].style.display = "none";
        }
        while (extraLines.length > MAX_LINES) {
            extraLines.shift()?.remove();
        }
        if (termLog) termLog.scrollTop = termLog.scrollHeight;
    };

    const print = (text: string, tone: "ink" | "muted" | "accent" = "muted") => {
        if (!termExtra) return;
        const line = document.createElement("div");
        line.className = `t-${tone}`;
        line.textContent = text;
        termExtra.append(line);
        extraLines.push(line);
        trimBuffer();
    };

    const clearTerminal = () => {
        extraLines.forEach((el) => el.remove());
        extraLines = [];
        staticLines.forEach((el) => el.style.removeProperty("display"));
        if (termInput) termInput.value = "";
        if (termTyped) termTyped.textContent = "";
        if (termHint) termHint.style.removeProperty("display");
    };

    const SECTIONS = ["work", "design", "photo", "about", "contact"];

    const runCommand = (raw: string) => {
        const cmd = raw.trim().toLowerCase();
        print(`$ ${raw.trim()}`, "ink");
        if (cmd === "") return;
        if (cmd === "help") {
            print("commands: work · design · photo · about · contact · whoami · replay · clear");
        } else if (cmd === "whoami") {
            print("full-stack engineer, new york — designer's eye, engineer's hand");
        } else if (SECTIONS.includes(cmd)) {
            const target = document.getElementById(cmd);
            if (target) {
                print(`→ scrolling to /${cmd}`, "accent");
                target.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
            } else {
                window.location.href = `/#${cmd}`;
            }
        } else if (cmd === "replay") {
            print("⟲ replaying the draft", "accent");
            replay();
        } else if (cmd === "clear") {
            clearTerminal();
        } else if (cmd.startsWith("sudo")) {
            print("nice try.", "accent");
        } else {
            print(`command not found: ${cmd} — try help`);
        }
    };

    if (termInput && termTyped) {
        termInput.addEventListener("input", () => {
            termTyped.textContent = termInput.value;
            if (termHint) termHint.style.display = termInput.value ? "none" : "";
        });
        termInput.addEventListener("keydown", (e) => {
            if (e.key !== "Enter") return;
            runCommand(termInput.value);
            termInput.value = "";
            termTyped.textContent = "";
            if (termHint) termHint.style.removeProperty("display");
        });
        terminal?.addEventListener("click", (e) => {
            if (!(e.target as HTMLElement).closest("a, button")) {
                termInput.focus({ preventScroll: true });
            }
        });
    }

    /* ---------- crosshair + coordinate chip (fine pointers only) ---------- */

    if (window.matchMedia("(pointer: fine)").matches && crossV && crossH && crossChip) {
        const SNAP = 8;
        let pending = false;
        let mx = 0;
        let my = 0;

        const paint = () => {
            pending = false;
            const rect = hero.getBoundingClientRect();
            const x = Math.round((mx - rect.left) / SNAP) * SNAP;
            const y = Math.round((my - rect.top) / SNAP) * SNAP;
            crossV.style.left = `${x}px`;
            crossH.style.top = `${y}px`;
            crossChip.textContent =
                `X ${String(Math.max(0, x)).padStart(4, "0")} · ` +
                `Y ${String(Math.max(0, y)).padStart(4, "0")} — SNAP ${SNAP}`;
            const chipW = crossChip.offsetWidth;
            const chipH = crossChip.offsetHeight;
            const cx = x + 14 + chipW > rect.width ? x - 14 - chipW : x + 14;
            const cy = y + 18 + chipH > rect.height ? y - 18 - chipH : y + 18;
            crossChip.style.left = `${cx}px`;
            crossChip.style.top = `${cy}px`;
        };

        hero.addEventListener("mousemove", (e) => {
            mx = e.clientX;
            my = e.clientY;
            hero.classList.add("cross-on");
            if (!pending) {
                pending = true;
                requestAnimationFrame(paint);
            }
        });
        hero.addEventListener("mouseleave", () => hero.classList.remove("cross-on"));
    }

    /* ---------- footer coordinates hover swap ---------- */

    if (coords) {
        const original = coords.textContent;
        coords.addEventListener("mouseenter", () => {
            coords.textContent = "LONG ISLAND CITY, NEW YORK ⌖";
        });
        coords.addEventListener("mouseleave", () => {
            coords.textContent = original;
        });
    }

    /* ---------- init ---------- */

    buildGrid();
    // Fonts change metrics — re-measure once they're ready, and on resize.
    measure();
    document.fonts?.ready.then(measure).catch(() => {});
    let resizeRaf = 0;
    window.addEventListener("resize", () => {
        cancelAnimationFrame(resizeRaf);
        resizeRaf = requestAnimationFrame(() => {
            buildGrid();
            measure();
        });
    });

    if (hero.classList.contains("play")) {
        startTimeline();
    } else {
        settle();
    }
}
