// https://www.cs.tufts.edu/comp/150GA/homeworks/hw1/Johnson%2075.PDF
// https://byvoid.com/zhs/blog/scc-tarjan/

export class GraphNode {
  constructor(id, data) {
    this.id = id;
    this.data = data;
    this.to = [];
  }

  addTo(node) {
    this.to.push(node);
  }
}

function tarjan(root, nodesSet, cls) {
  if (!cls) {
    cls = {
      low: new Map(),
      dfn: new Map(),
      count: 1,
      visited: new Set(),
      stack: [],
      // strong connect components
      sccs: [],
    };
  } else {
    cls.count++;
  }
  const { low, dfn, visited, stack, count, sccs } = cls;
  low.set(root, count);
  dfn.set(root, count);
  visited.add(root);
  stack.push(root);

  for (const next of root.to) {
    if (!nodesSet.has(next)) {
      continue;
    }
    if (!visited.has(next)) {
      tarjan(next, nodesSet, cls);
      low.set(root, Math.min(low.get(root), low.get(next)));
    } else if (stack.indexOf(next) !== -1 && dfn.get(next) < low.get(root)) {
      low.set(root, dfn.get(next));
    }
  }

  if (low.get(root) === dfn.get(root) && stack.length > 0) {
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

export class FindGraphCircuits {
  constructor(nodes) {
    this.initWithNodes(nodes);
  }
  initWithNodes(nodes) {
    // index
    this.nodes = nodes;
    this.nodesIndexMap = new Map();
    let i = 0;
    for (const n of nodes) {
      this.nodesIndexMap.set(n, i);
      i++;
    }
  }
  findMinScc(sccs) {
    let minNode;
    let minScc;
    const { nodesIndexMap } = this;
    for (const scc of sccs) {
      const sccMinNode = this.findMinNode(scc);
      if (
        !minNode ||
        nodesIndexMap.get(sccMinNode) < nodesIndexMap.get(minNode)
      ) {
        minNode = sccMinNode;
        minScc = scc;
      }
    }
    return minScc;
  }
  findMinNode(nodeList) {
    let min = Infinity;
    for (const n of nodeList) {
      min = Math.min(this.nodesIndexMap.get(n), min);
    }
    return this.nodes[min];
  }
  resetState() {
    this.blockNodesSet = new Set();
    this.stack = [];
    this.circuits = [];
    this.backwardsNodesMap = new Map();
  }
  removeBlock(node) {
    const { blockNodesSet, backwardsNodesMap } = this;
    blockNodesSet.delete(node);
    const backRef = backwardsNodesMap.get(node);
    if (backRef) {
      for (const backNode of backRef.values()) {
        this.removeBlock(backNode);
      }
      backwardsNodesMap.delete(node);
    }
  }
  findElementaryCircuit(node, start, strongNodesSet) {
    const { blockNodesSet, stack, circuits, backwardsNodesMap } = this;
    let find = false;
    blockNodesSet.add(node);
    stack.push(node);
    for (const next of node.to) {
      if (!strongNodesSet.has(next)) {
        continue;
      }
      if (next === start) {
        this.circuits.push([...stack]);
        find = true;
      } else if (!blockNodesSet.has(next)) {
        if (this.findElementaryCircuit(next, start, strongNodesSet)) {
          find = true;
        }
      }
    }
    if (find) {
      this.removeBlock(node);
    } else {
      for (const next of node.to) {
        let backRef = backwardsNodesMap.get(next);
        if (!backRef) {
          backRef = new Set();
          backwardsNodesMap.set(next, backRef);
        }
        backRef.add(node);
      }
    }

    stack.pop();
    return find;
  }
  findElementaryCircuits() {
    this.resetState();
    const { nodes, nodesIndexMap } = this;
    let s = 0;
    const n = nodes.length;
    const nodesSet = new Set(nodes);
    while (s < n) {
      const ret = tarjan(nodes[s], nodesSet);
      if (ret.sccs.length) {
        const scc = this.findMinScc(ret.sccs);
        const startNode = this.findMinNode(scc);
        this.findElementaryCircuit(startNode, startNode, new Set(scc));
        s = nodesIndexMap.get(startNode) + 1;
        for (let i = 0; i < s; i++) {
          nodesSet.delete(nodes[i]);
        }
      } else {
        break;
      }
    }
    return this.circuits;
  }
}

export function findElementaryCircuits(graphNodes) {
  return new FindGraphCircuits(graphNodes).findElementaryCircuits();
}
