import { isKeyHotkey } from '../../vendors/is-hotkey.js';

const checkBackspace = isKeyHotkey('backspace');

function diffValue(prevValue, value) {
  let prevCursor = prevValue.length;
  let cursor = value.length;
  let endCursor = Math.min(prevCursor, cursor);
  let start = 0;
  for (; start < endCursor && prevValue[start] === value[start]; start++);
  let inserted;
  let deleted;
  if (start < prevCursor) {
    deleted = prevValue.slice(start, prevCursor);
  } else {
    inserted = value.slice(start);
  }
  return {
    deleted,
    inserted,
  };
}

export default class Input {
  constructor(props) {
    this.props = props;
    this.composing = false;
    const { textArea } = props;
    this.prevValue = textArea.value;
    textArea.addEventListener('keydown', this.onKeyDown);
    textArea.addEventListener('input', this.onInput);
    textArea.addEventListener('compositionstart', this.onCompositionStart);
    textArea.addEventListener('compositionend', this.onCompositionEnd);
  }
  destroy() {
    const { textArea } = this.props;
    textArea.removeEventListener('keydown', this.onKeyDown);
    textArea.removeEventListener('input', this.onInput);
    textArea.removeEventListener('compositionstart', this.onCompositionStart);
    textArea.removeEventListener('compositionend', this.onCompositionEnd);
  }
  reset = () => {
    const { textArea } = this.props;
    this.prevValue = textArea.value = '';
    textArea.selectionStart = textArea.selectionEnd = 0;
  };
  clearResetTimer() {
    if (this.resetTimer) {
      clearTimeout(this.resetTimer);
      this.resetTimer = null;
    }
  }
  bufferReset = () => {
    this.clearResetTimer();
    this.resetTimer = setTimeout(this.reset, 300);
  };
  onCompositionStart = (event) => {
    // console.log('fire onCompositionStart');
    this.clearResetTimer();
    this.reset();
    this.composing = true;
  };
  onCompositionEnd = (event) => {
    // console.log('fire onCompositionEnd');
    this.composing = false;
    this.onInput(event);
  };
  onKeyDown = (event) => {
    if (this.composing) {
      return;
    }
    if (checkBackspace(event)) {
      event.preventDefault();
      this.props.onDeleteBackward({});
    }
  };
  onInput = (event) => {
    const { value } = event.target;
    // console.log('fire onInput', value);
    if (this.composing) {
      this.props.onCompositionUpdate({ value });
    } else {
      const diff = diffValue(this.prevValue, value);
      if (diff.deleted) {
        this.props.onDeleteBackward({});
      } else if (diff.inserted) {
        this.props.onInsert({ value: diff.inserted });
      }
      this.bufferReset();
      this.prevValue = value;
    }
  };
}
