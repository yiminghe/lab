// https://www.cs.tufts.edu/comp/150GA/homeworks/hw1/Johnson%2075.PDF
// https://byvoid.com/zhs/blog/scc-tarjan/


class Node {
  constructor(id) {
    this.id = id;
    this.to = [];
  }

  addTo(node) {
    this.to.push(node);
  }
}

const nodesMap = new Map();

for (const id of ['b', 'c', 'a', 'd', 'e']) {
  nodesMap.set(id, new Node(id));
}

nodesMap.get('a').addTo(nodesMap.get('b'));
nodesMap.get('b').addTo(nodesMap.get('c'));
nodesMap.get('c').addTo(nodesMap.get('a'));

nodesMap.get('a').addTo(nodesMap.get('d'));
nodesMap.get('d').addTo(nodesMap.get('e'));
// nodesMap.get('e').addTo(nodesMap.get('a'));

function tarjan(root, cls = {}) {
  let {
    low = new Map(),
    dfn = new Map(),
    count = 0,
    visited = new Map(),
    stack = [],
    sccs = [],
  } = cls;
  count++;
  Object.assign(cls, { low, dfn, count, visited, stack, sccs });
  ({ count } = cls);
  low.set(root, count);
  dfn.set(root, count);
  visited.set(root, true);
  stack.push(root)

  for (const next of root.to) {
    if (!visited.get(next)) {
      tarjan(next, cls);
      low.set(root, Math.min(low.get(root), low.get(next)));
    } else if (stack.indexOf(next) !== -1 && dfn.get(next) < low.get(root)) {
      low.set(root, dfn.get(next));
    }
  }

  if (low.get(root) === dfn.get(root) && stack.length > 0) {
    let s = [...stack];
    let next;
    let scc = [];
    do {
      next = stack.pop();
      scc.push(next);
    } while (next !== root);

    if (scc.length > 1) {
      sccs.push(scc.reverse());
    }
  }

  return cls;
}

const ret = tarjan(nodesMap.get('b'));

console.log(ret);