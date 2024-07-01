function* nest() {
  for (var i = 10; i < 15; i++) {
    console.log(i);
    yield { v: i };
  }
}

function* outer() {
  for (var i = 1; i < 5; i++) {
    console.log(i);
    yield { v: i };
  }
  yield nest();
  return 'xx';
}

var co = require('co');

co(outer)(function (err, content) {
  console.log('finally ' + (err || content));
});
