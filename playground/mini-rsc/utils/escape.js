const ESCAPE_LOOKUP = {
  '&': '\\u0026',
  '>': '\\u003e',
  '<': '\\u003c',
  //'"': '\\u0022',
  //'\'': '\\u0027',
};
const ESCAPE_REGEX = /[&><"']/g;

export function htmlEscapeJsonString(str) {
  return str.replace(ESCAPE_REGEX, (match) => ESCAPE_LOOKUP[match] || match);
}

export function htmlEscapeAttributeString(str) {
  return str.replace(
    /["'>]/g,
    (match) =>
      ({
        '"': '&quot;',
        '>': '&gt;',
        '<': '&lt;',
        "'": '&#039;',
      })[match],
  );
}
