/* Field report interactivity. Markup is fully server-rendered; this module
   only swaps visibility: tile→view switching, sealed-season accordions,
   match-log filters, chart scale toggle and the per-match season filter.
   Nothing here computes a stat — numbers are baked in at build time. */

const root = document.getElementById("field-report");

if (root) {
    const $ = <T extends HTMLElement>(sel: string) =>
        root.querySelector<T>(sel);
    const $$ = <T extends HTMLElement>(sel: string) =>
        Array.from(root.querySelectorAll<T>(sel));

    const live = $("[data-fr-live]");
    const announce = (text: string) => {
        if (live) live.textContent = text;
    };

    /* ---- tiles ↔ views ---- */

    const tiles = $$("[data-fr-tile]");
    const views = $$("[data-fr-view]");
    const footlabel = $("[data-fr-footnote]");
    const goalsView = $('[data-fr-view="goals"]');
    const VIEW_NAMES: Record<string, string> = {
        seasons: "season ledger",
        matches: "match log",
        record: "record",
        goals: "goals charts",
        assists: "assists charts",
    };

    tiles.forEach((tile) => {
        tile.addEventListener("click", () => {
            const target = tile.dataset.frTarget;
            tiles.forEach((t) => {
                const active = t === tile;
                t.setAttribute("aria-pressed", String(active));
                const viewing =
                    t.querySelector<HTMLElement>("[data-fr-viewing]");
                if (viewing) viewing.hidden = !active;
            });
            let shown: HTMLElement | undefined;
            views.forEach((v) => {
                v.hidden = v.dataset.frView !== target;
                if (!v.hidden) shown = v;
            });
            if (goalsView) {
                goalsView.dataset.emphasis =
                    tile.dataset.frTile === "assists" ? "assists" : "goals";
            }
            if (footlabel && shown?.dataset.frFootlabel) {
                footlabel.textContent = shown.dataset.frFootlabel;
            }
            announce(
                `Showing ${VIEW_NAMES[tile.dataset.frTile ?? ""] ?? target}`
            );
        });
    });

    /* ---- sealed-season accordions (0fr→1fr grid rows) ---- */

    $$("[data-fr-expand]").forEach((btn) => {
        const body = document.getElementById(
            btn.getAttribute("aria-controls") ?? ""
        );
        const word = btn.querySelector<HTMLElement>("[data-fr-expand-word]");
        if (!body) return;
        body.classList.add("lg-anim");
        let pendingHide: ((e: TransitionEvent) => void) | null = null;

        btn.addEventListener("click", () => {
            const open = btn.getAttribute("aria-expanded") === "true";
            btn.setAttribute("aria-expanded", String(!open));
            if (word) word.textContent = open ? "EXPAND" : "COLLAPSE";
            if (pendingHide) {
                body.removeEventListener("transitionend", pendingHide);
                pendingHide = null;
            }
            if (open) {
                body.classList.remove("is-open");
                pendingHide = (e: TransitionEvent) => {
                    if (e.propertyName !== "grid-template-rows") return;
                    body.hidden = true;
                    if (pendingHide)
                        body.removeEventListener("transitionend", pendingHide);
                    pendingHide = null;
                };
                body.addEventListener("transitionend", pendingHide);
            } else {
                body.hidden = false;
                // Two frames so the 0fr start state paints before 1fr lands.
                requestAnimationFrame(() =>
                    requestAnimationFrame(() => body.classList.add("is-open"))
                );
            }
        });
    });

    /* ---- dropdown chips (log filters + per-match season) ---- */

    const chips = $$("[data-fr-filter]");
    const state: Record<string, string> = {};
    chips.forEach((chip) => {
        state[chip.dataset.frFilter ?? ""] = chip.dataset.frValue ?? "all";
    });

    function closeMenus() {
        chips.forEach((chip) => {
            chip.setAttribute("aria-expanded", "false");
            const menu = chip.nextElementSibling as HTMLElement | null;
            if (menu) menu.hidden = true;
        });
    }

    chips.forEach((chip) => {
        const key = chip.dataset.frFilter ?? "";
        const menu = chip.nextElementSibling as HTMLElement | null;
        const valueEl = chip.querySelector<HTMLElement>(
            "[data-fr-filter-value]"
        );
        if (!menu) return;

        chip.addEventListener("click", () => {
            const wasOpen = chip.getAttribute("aria-expanded") === "true";
            closeMenus();
            chip.setAttribute("aria-expanded", String(!wasOpen));
            menu.hidden = wasOpen;
        });

        menu.addEventListener("click", (e) => {
            const opt = (e.target as HTMLElement).closest<HTMLElement>(
                "[data-fr-option]"
            );
            if (!opt) return;
            const value = opt.dataset.frOption ?? "all";
            state[key] = value;
            chip.dataset.frValue = value;
            chip.classList.toggle("is-set", value !== "all");
            if (valueEl) valueEl.textContent = opt.textContent?.trim() ?? "ALL";
            closeMenus();
            if (key === "pm-season") applyPmSeason();
            else applyLogFilters();
        });
    });

    document.addEventListener("click", (e) => {
        const t = e.target as HTMLElement;
        if (!t.closest("[data-fr-filter], .fchip-menu")) closeMenus();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeMenus();
    });

    /* ---- match-log filtering ---- */

    const logRows = $$("[data-fr-log] tbody tr");
    const showingEl = $("[data-fr-showing]");
    const moreBtn = $("[data-fr-more]");
    const currentSeasonId = moreBtn?.dataset.frCurrentSeason;

    function applyLogFilters() {
        let shown = 0;
        logRows.forEach((row) => {
            const visible =
                (state.season === "all" ||
                    row.dataset.season === state.season) &&
                (state.league === "all" ||
                    row.dataset.league === state.league) &&
                (state.team === "all" || row.dataset.team === state.team);
            row.hidden = !visible;
            if (visible) shown++;
        });
        if (showingEl) {
            showingEl.textContent = `SHOWING ${shown} OF ${logRows.length} · NEWEST FIRST`;
        }
        // The EARLIER MATCHES row exists for the default view only — once
        // any filter moves off it, the full register is a click away anyway.
        if (moreBtn) {
            moreBtn.hidden = !(
                state.season === currentSeasonId &&
                state.league === "all" &&
                state.team === "all"
            );
        }
    }

    moreBtn?.addEventListener("click", () => {
        state.season = "all";
        const chip = $('[data-fr-filter="season"]');
        if (chip) {
            chip.dataset.frValue = "all";
            chip.classList.remove("is-set");
            const v = chip.querySelector<HTMLElement>("[data-fr-filter-value]");
            if (v) v.textContent = "ALL";
        }
        applyLogFilters();
        announce("Showing all matches");
    });

    /* ---- chart scale toggle ---- */

    const scaleBtns = $$("[data-fr-scale]");
    const scalePanels = $$("[data-fr-scale-panel]");
    const pmFilter = $("[data-fr-pm-filter]");

    scaleBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            const scale = btn.dataset.frScale;
            scaleBtns.forEach((b) => {
                const active = b === btn;
                b.setAttribute("aria-pressed", String(active));
                const dot = b.querySelector<HTMLElement>("[data-fr-scale-dot]");
                if (dot) dot.hidden = !active;
            });
            scalePanels.forEach((p) => {
                p.hidden = p.dataset.frScalePanel !== scale;
            });
            if (pmFilter) pmFilter.hidden = scale !== "per-match";
        });
    });

    /* ---- per-match season variants (pre-rendered, swapped) ---- */

    const pmPanels = $$("[data-fr-pm-panel]");

    function applyPmSeason() {
        pmPanels.forEach((p) => {
            p.hidden = p.dataset.frPmPanel !== state["pm-season"];
        });
    }
}
