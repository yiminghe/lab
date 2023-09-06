// https://en.wikipedia.org/wiki/Trie

export interface TrieNode<Value> {
  children: (TrieNode<Value> | undefined)[];
  isTerminal: boolean;
  value: Value;
}

function newNode<Value>(defaultValue: Value): TrieNode<Value> {
  return {
    children: [],
    isTerminal: false,
    value: defaultValue,
  };
}
var startIndex = 'A'.charCodeAt(0);

function getCharIndex(c: string) {
  return c.charCodeAt(0) - startIndex;
}

function getCharByIndex(index: number) {
  return String.fromCharCode(index + startIndex);
}

function trieDelete<Value>(
  x: TrieNode<Value>,
  key: string,
  defaultValue: Value,
  index = 0,
) {
  if (index === key.length) {
    if (x.isTerminal) {
      x.isTerminal = false;
      x.value = defaultValue;
    }
    for (let i = 0; i < x.children.length; i++) {
      if (x.children[i]) {
        return x;
      }
    }
    return undefined;
  }
  const c = getCharIndex(key[index]);
  if (x.children[c]) {
    x.children[c] = trieDelete(x.children[c]!, key, defaultValue, index + 1);
  }
}

function trieTraverse<Value>(
  node: TrieNode<Value>,
  log?: any,
  word: string[] = [],
) {
  if (node.isTerminal) {
    if (log) log(word.join(''), node.value);
  }
  var next = node.children;
  var len = next.length;
  var wordLen = word.length;
  for (var i = 0; i < len; i++) {
    var c = next[i];
    if (c) {
      word[wordLen] = getCharByIndex(i);
      trieTraverse(c, log, word);
      word.length = wordLen;
    }
  }
}

export class Trie<Value> {
  root: TrieNode<Value>;
  defaultValue: Value;
  constructor(defaultValue: Value) {
    this.defaultValue = defaultValue;
    this.root = newNode(defaultValue);
  }
  find(key: string) {
    let ret: TrieNode<Value> | undefined = this.root;
    for (let i = 0; i < key.length; i++) {
      const c = getCharIndex(key[i]);
      ret = ret.children[c];
      if (!ret) {
        return undefined;
      }
    }
    return ret;
  }
  insert(key: string, value: any) {
    let ret: TrieNode<Value> = this.root;
    for (let i = 0; i < key.length; i++) {
      const c = getCharIndex(key[i]);
      if (!ret.children[c]) {
        ret.children[c] = newNode(this.defaultValue);
      }
      ret = ret.children[c]!;
    }
    ret.value = value;
    ret.isTerminal = true;
    return ret;
  }
  delete(key: string) {
    trieDelete(this.root, key, this.defaultValue);
  }
  visit(visitor: (key: string, node: Value) => void) {
    trieTraverse(this.root, visitor);
  }
}
