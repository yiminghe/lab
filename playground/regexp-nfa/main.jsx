import { match } from './nfa.jsx';

const { useState, useRef, useCallback } = React;

function App() {
  const input = useRef();

  const run = useCallback(() => {
    const { value } = input.current;
    console.log(match(value));
  }, []);

  return (
    <div>
      <input ref={input} defaultValue="aab" /> .match(/a*b/) &nbsp;
      <button onClick={run}>click and see console</button>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
