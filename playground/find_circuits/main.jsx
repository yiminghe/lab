import { GraphNode, findElementaryCircuits } from "./findElementaryCircuits.js";

function constructNodes(ids) {
  const idMap = new Map();

  function node(id) {
    if (idMap.get(id)) {
      return idMap.get(id);
    }
    const n = new GraphNode(id);
    idMap.set(id, n);
    return n;
  }

  function edge(n1, n2) {
    n1.addTo(n2);
  }

  for (const id of ids) {
    edge(node(id[0]), node(id[1]));
  }

  // https://dreampuf.github.io/GraphvizOnline/
  function toDot() {
    let edges = ids.map((id) => `\"${id[0]}\" -> \"${id[1]}\"`);
    return `digraph g {
      ${edges.join(';\n')}
      }`;
  }

  return { nodes: Array.from(idMap.values()), dot: toDot() };
}

const defaultData = [
  ['b', 'c'],
  [],
  ['c', 'a'],
  [],
  ['a', 'd'],
  [],
  ['d', 'e'],
  [],
  ['a', 'b'],
  [],
  ['e', 'a'],
  [],
  ['c', 'e'],
];

const { useRef, useEffect } = React;

var viz = new Viz();

function App() {
  const input = useRef();
  const result = useRef();
  const span = useRef();

  function run() {
    let value = input.current.value.trim();
    value = value.split(/\n+/).map(s => s.trim()).map(s => {
      const v = s.split('>');
      return v.map(vv => vv.trim());
    });
    const { nodes, dot } = constructNodes(value);
    viz.renderSVGElement(dot).then(function (el) {
      if (span.current.firstChild) {
        span.current.removeChild(span.current.firstChild);
      }
      span.current.appendChild(el);
    });
    result.current.value = (
      findElementaryCircuits(nodes).map(v => v.map((n) => n.id)).map(v => v.join(' > ')).join('\n\n'));
  }

  useEffect(() => {
    run();
  }, []);

  return <div>
    <h2>find all the elementary circuits of a directed graph</h2>
    <span style={{ verticalAlign: 'top',fontWeight:'bolder' }}>edges:</span>
    &nbsp;
    <textarea style={{ width: 200, height: 200, verticalAlign: 'top' }} ref={input} defaultValue={
      defaultData.map(d => d.length ? `${d[0]} > ${d[1]}` : '').join('\n')
    }>
    </textarea>
    &nbsp;
    <span ref={span}></span>
    &nbsp;
    <span style={{ verticalAlign: 'top',fontWeight:'bolder' }}>circuits:</span>
    &nbsp;
    <textarea style={{ width: 200, height: 200, verticalAlign: 'top' }} ref={result} />
    <br />
    <button onClick={run}>run</button>
  </div>;
}

ReactDOM.render(<App />, document.getElementById('root'));
