/**
 * DevConsole Toolkit — DOM Utilities
 * Advanced DOM manipulation, querying, and inspection helpers.
 */

const DCTDom = {
    // Query helpers
    $(selector, parent = document) { return parent.querySelector(selector); },
    $$(selector, parent = document) { return Array.from(parent.querySelectorAll(selector)); },

    // Find elements by text content
    findByText(text, tag = '*') {
        return Array.from(document.querySelectorAll(tag)).filter(el =>
            el.textContent.toLowerCase().includes(text.toLowerCase())
        );
    },

    // Find elements by attribute value
    findByAttr(name, value) {
        return Array.from(document.querySelectorAll(`[${name}]`)).filter(el =>
            value ? el.getAttribute(name).includes(value) : true
        );
    },

    // Get element info
    getInfo(el) {
        if (!el) return null;
        return {
            tag: el.tagName?.toLowerCase(),
            id: el.id || null,
            classes: Array.from(el.classList),
            attributes: Array.from(el.attributes).map(a => ({ name: a.name, value: a.value.substring(0, 100) })),
            text: el.textContent?.substring(0, 200),
            children: el.children?.length || 0,
            parent: el.parentElement?.tagName?.toLowerCase(),
            position: el.getBoundingClientRect ? (() => {
                const r = el.getBoundingClientRect();
                return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
            })() : null
        };
    },

    // Get element tree
    getTree(el, depth = 3) {
        if (!el || depth <= 0) return null;
        return {
            tag: el.tagName?.toLowerCase(),
            id: el.id || undefined,
            childCount: el.children?.length || 0,
            children: Array.from(el.children || []).slice(0, 10).map(c => this.getTree(c, depth - 1))
        };
    },

    // Highlight element
    highlight(el, color = '#ff0000', duration = 3000) {
        if (!el) return;
        const orig = el.style.outline;
        el.style.outline = `3px solid ${color}`;
        el.style.outlineOffset = '2px';
        setTimeout(() => { el.style.outline = orig; el.style.outlineOffset = ''; }, duration);
    },

    // Get all event listeners (limited - browser dependent)
    getEventListeners(el) {
        const listeners = [];
        try {
            if (window.getEventListeners) {
                return window.getEventListeners(el);
            }
        } catch (e) {}
        return listeners;
    },

    // DOM mutation observer
    observeMutations(callback, options = {}) {
        const observer = new MutationsObserver(mutations => {
            mutations.forEach(m => {
                callback({
                    type: m.type,
                    target: m.target?.tagName,
                    added: m.addedNodes?.length || 0,
                    removed: m.removedNodes?.length || 0,
                    attributes: m.attributeName || null
                });
            });
        });
        observer.observe(options.target || document.documentElement, {
            childList: true, subtree: true, attributes: true, ...options
        });
        return { observer, stop: () => observer.disconnect() };
    }
};

if (typeof window !== 'undefined') window.DCTDom = DCTDom;
