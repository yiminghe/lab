class Input {
  constructor(str, startIndex = 0, index = 0) {
    this.str = str;
    this.startIndex = startIndex;
    this.index = index || startIndex;
    this.endIndex = str.length - 1;
  }

  advance(count) {
    this.index += count;
  }

  getString(count = 1) {
    return this.str.slice(this.index, this.index + count);
  }

  clone() {
    return new Input(this.str, this.startIndex, this.index);
  }

  isEnd() {
    return this.index > this.endIndex;
  }
}

class State {
  constructor(type) {
    this.type = type;
    this.transitions = [];
  }
}

class Transition {
  constructor(to, condition) {
    this.to = to;
    this.condition = condition;
  }
  perform(input) {
    if (this.condition) {
      return this.condition(input);
    }
    return {
      count: 0
    };
  }
}

function createMatchStringCondition(str) {
  return (input) => {
    return input.getString(str.length) === str ? { count: str.length } : null;
  };
}

//  /a*b/
const aBefore = new State('<a');
const aAfter = new State('a>');

const repeatBefore = new State('<*');
const repeatAfter = new State('*>');

const bBefore = new State('<b');
const bAfter = new State('b>');

bBefore.transitions.push(new Transition(bAfter, createMatchStringCondition('b')));

aBefore.transitions.push(new Transition(aAfter, createMatchStringCondition('a')));
aAfter.transitions.push(new Transition(aBefore));

repeatBefore.transitions.push(new Transition(aBefore));

aBefore.transitions.push(new Transition(repeatAfter));

repeatAfter.transitions.push(new Transition(bBefore));

const start = repeatBefore;

export function match(str) {
  const l = str.length;
  for (let i = 0; i < l; i++) {
    const input = new Input(str, i);
    if (matchInput(input)) {
      return {
        match: [str.slice(input.startIndex, input.index)],
        index: input.startIndex,
      }
    }
  }
  return null;
}

function matchInput(input, state = start) {
  if (!state.transitions.length) {
    return true;
  }
  if (input.isEnd()) {
    return false;
  }
  for (const t of state.transitions) {
    let newInput = input.clone();
    const find = t.perform(newInput);
    if (find) {
      newInput.advance(find.count);
      if (matchInput(newInput, t.to)) {
        input.index = newInput.index;
        return true;
      }
    } else {
      continue;
    }
  }
  return false;
}
