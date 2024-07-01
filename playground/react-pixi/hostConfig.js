import { PIXI_NODE } from './types.js';

function withLog(log, fn) {
  return (...args) => {
    console.log(log);
    return fn(...args);
  };
}

function appendChild(parent, child) {
  parent.addChild(child);
}

function insertBefore(parent, child, beforeChild) {
  const beforeChildIndex = parent.getChildIndex(beforeChild);
  parent.addChildAt(child, beforeChildIndex);
}

function removeChild(parent, child) {
  parent.removeChild(child);
}

const hostConfig = {
  now: Date.now,

  getPublicInstance: (inst) => {
    return inst;
  },

  getRootHostContext: () => {
    return {};
  },

  shouldSetTextContent: () => {
    return false;
  },

  prepareForCommit() {},

  resetAfterCommit() {},

  getChildHostContext(parentContext) {
    return parentContext;
  },

  createInstance(type, newProps, container) {
    if (type === PIXI_NODE) {
      const inst = newProps.pixiFactory(newProps);
      if (newProps.pixiInit) {
        newProps.pixiInit(inst, newProps);
      }
      return inst;
    }
  },

  createTextInstance(text, container) {},

  commitTextUpdate(node, oldText, newText) {},

  prepareUpdate(node, type, oldProps, newProps) {
    return true;
  },

  commitUpdate(node, updatePayload, type, oldProps, newProps) {
    newProps.pixiUpdate(node, newProps, oldProps);
  },

  appendInitialChild: appendChild,

  appendChild: appendChild,

  insertBefore: insertBefore,

  removeChild: removeChild,

  finalizeInitialChildren() {},

  appendChildToContainer: appendChild,

  insertInContainerBefore: insertBefore,

  removeChildFromContainer: removeChild,

  cloneHiddenInstance(inst) {
    return inst;
  },

  cloneInstance(inst) {
    return inst;
  },

  createContainerChildSet(container) {
    container.removeChildren();
    return container;
  },

  appendChildToContainerChildSet(childSet, child) {
    childSet.addChild(child);
  },

  finalizeContainerChildren() {},

  replaceContainerChildren() {},

  supportsMutation: true,

  supportsPersistence: false,
};

// hostConfig.supportsMutation = false;
// hostConfig.supportsPersistence = true;

// Object.keys(hostConfig).forEach(k => {
//   const v = hostConfig[k];
//   if (typeof v === 'function') {
//     hostConfig[k] = withLog(k, v);
//   }
// });

export default hostConfig;
