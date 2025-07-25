export function constrain(v, min, max) {
  return Math.min(max, Math.max(v, min));
}

export function sameSign(a, b) {
  return (a > 0 && b > 0) || (a < 0 && b < 0);
}

export function isTextNode(el) {
  return el.nodeType === 3;
}

export function closest(el, s, limit) {
  if (isTextNode(el)) {
    el = el.parentNode;
  }
  if (!limit.contains(el)) return null;
  do {
    if (!el || !el.matches) {
      debugger;
    }
    if (el.matches(s)) return el;
    el = el.parentElement;
  } while (el !== limit);
  return null;
}

export function setDataset(el, vs) {
  el.dataset[vs[0]] = vs[1];
}

export function eqDataset(el, vs) {
  return el.dataset && el.dataset[vs[0]] === vs[1];
}

export function getEqDatasetQuery(vs) {
  return `[data-${vs[0]}=${vs[1]}]`;
}

function traverseNode(n, datasetMap, fn) {
  if (isTextNode(n) || eqDataset(n, datasetMap.void)) {
    return fn(n);
  }
  let ret = false;
  if (n.childNodes) {
    for (const c of n.childNodes) {
      ret = traverseNode(c, datasetMap, fn);
      if (ret) {
        break;
      }
    }
  }
  return ret;
}

export function findNodesInBlock(p, datasetMap, { start, end }) {
  const nodes = [];
  let started = !start;
  traverseNode(p, datasetMap, (n) => {
    if (n === start) {
      started = true;
    }
    if (started) {
      let nn = n;
      if (isTextNode(nn)) {
        nn = nn.parentNode;
      }
      nodes.push(nn);
    }
    if (n === end) {
      started = false;
      return true;
    }
  });
  return nodes;
}

export function getChildElement(parent, index) {
  return parent && parent.childNodes && parent.childNodes[index];
}

export function px(i) {
  return i + 'px';
}

export function extendSelection(selection) {
  let { anchorNode, anchorOffset, focusNode, focusOffset } = selection;

  let anchorElement = anchorNode;
  if (!isTextNode(anchorElement)) {
    anchorElement = anchorNode.childNodes[anchorOffset];
  }
  let focusElement = focusNode;
  if (!isTextNode(focusElement)) {
    focusElement = focusNode.childNodes[focusOffset];
  }
  return {
    ...selection,
    focusElement,
    anchorElement,
  };
}

export function eqSelection(s1, s2) {
  return (
    s1.focusNode === s2.focusNode &&
    s1.anchorNode === s2.anchorNode &&
    s1.focusOffset === s2.focusOffset &&
    s1.anchorOffset === s2.anchorOffset
  );
}

export function isVoidSelected(selection) {
  if (!selection) {
    return false;
  }
  const { focusNode, focusElement, anchorElement } = extendSelection(selection);
  return !isTextNode(focusNode) && focusElement === anchorElement;
}
