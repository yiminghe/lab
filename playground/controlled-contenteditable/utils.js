export function constrain(v, min, max) {
    return Math.min(max, Math.max(v, min));
}

export function sameSign(a, b) {
    return a > 0 && b > 0 || a < 0 && b < 0;
}

export function closest(el, s, limit) {
    if (el.nodeType === 3) {
        el = el.parentNode;
    }
    if (!limit.contains(el)) return null;
    do {
        if (el.matches(s)) return el;
        el = el.parentElement;
    } while (el !== limit);
    return null;
};

export function setDataset(el, vs) {
    el.dataset[vs[0]] = vs[1];
}

export function eqDataset(el, vs) {
    return el.dataset[vs[0]] === vs[1];
}

export function getEqDatasetQuery(vs){
    return `[data-${vs[0]}=${vs[1]}]`;
}
