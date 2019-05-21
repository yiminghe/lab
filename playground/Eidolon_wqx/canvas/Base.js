class Base {
  constructor(values) {
    this.initialValues = values || {};
    this.attrs = { ...this.initialValues };
    this.listeners = {};
  }

  set(attr, v) {
    const prevVal = this.get(attr);
    const ATTRS = this.constructor.ATTRS && this.constructor.ATTRS[attr] || {};
    if (ATTRS.setter) {
      ATTRS.setter.call(this, v);
    }
    this.attrs[attr] = v;
    const listeners = this.listeners[`${attr}Change`] || [];
    for (var l of listeners) {
      l.call(this, {
        newVal: v,
        prevVal,
      });
    }
  }

  reset(attr) {
    const prevVal = this.attrs[attr];
    delete this.attrs[attr];
    const newVal = this.get(attr);
    const listeners = this.listeners[`${attr}Change`] || [];
    for (var l of listeners) {
      l.call(this, {
        newVal,
        prevVal,
      });
    }
  }

  after(name, fn) {
    const listeners = this.listeners[name] = this.listeners[name] || [];
    listeners.push(fn);
  }

  get(attr) {
    const ATTRS = this.constructor.ATTRS && this.constructor.ATTRS[attr] || {};
    if (ATTRS.getter) {
      return ATTRS.getter.call(this);
    }
    if (attr in this.attrs) {
      return this.attrs[attr];
    }
    if (ATTRS.valueFn) {
      this.attrs[attr] = ATTRS.valueFn.call(this);
    }
    if ('value' in ATTRS) {
      this.attrs[attr] = ATTRS.value;
    }
    if (attr in this.attrs) {
      return this.attrs[attr];
    }
    return this.initialValues[attr];
  }
}

export default Base;
