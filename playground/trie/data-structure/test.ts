import { Trie } from './trie';

var str =
  'In computer science, a trie, also called digital tree and sometimes radix tree or prefix tree (as they can be searched by prefixes), is an ordered tree data structure that is used to store a dynamic set or associative array where the keys are usually strings. Unlike a binary search tree, no node in the tree stores the key associated with that node; instead, its position in the tree defines the key with which it is associated. All the descendants of a node have a common prefix of the string associated with that node, and the root is associated with the empty string. Values are normally not associated with every node, only with leaves and some inner nodes that correspond to keys of interest. For the space-optimized presentation of prefix tree, see compact prefix tree.';

function isCharacter(c: string) {
  return (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
}

interface Value {
  count: number;
}

function count(str: string) {
  var maxCount = 0;
  var maxStart, maxEnd;
  var tree = new Trie<Value>({ count: 0 });
  var start = 0;
  var len = str.length;
  for (var i = 0; i < len; i++) {
    var c = str.charAt(i);
    if (!isCharacter(c)) {
      if (start !== i) {
        const subStr = str.slice(start, i);
        let cur = tree.find(subStr);
        if (!cur) {
          cur = tree.insert(subStr, {
            count: 0,
          });
        } else if (!cur.isTerminal) {
          cur.isTerminal = true;
          cur.value = {
            count: 0,
          };
        }
        cur.value.count++;
        if (cur.value.count > maxCount) {
          maxCount = cur.value.count;
          maxStart = start;
          maxEnd = i;
        }
      }
      start = i + 1;
    }
  }
  return {
    trie: tree,
    count: maxCount,
    str: str.slice(maxStart, maxEnd),
  };
}

const ret = count(str);

console.log(ret);

ret.trie.visit((word: string, value) => {
  console.log(word + ' : ' + value.count);
});
