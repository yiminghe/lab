import { PIXI_NODE } from "./types.js";

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

export default {
  now: Date.now,

  getPublicInstance(inst) {
    return inst;
  },

  getRootHostContext() {
    return {};
  },

  shouldSetTextContent() {
    return false;
  },

  prepareForCommit() {
  },

  resetAfterCommit() {
  },

  getChildHostContext() {
    return {};
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

  createTextInstance(text, container) {
  },

  commitTextUpdate(node, oldText, newText) {
  },

  prepareUpdate(node, type, oldProps, newProps) {
    return true;
  },

  commitUpdate(
    node,
    updatePayload,
    type,
    oldProps,
    newProps
  ) {
    newProps.pixiUpdate(node, newProps, oldProps);
  },

  appendInitialChild:appendChild,

  appendChild,

  insertBefore,

  removeChild,

  finalizeInitialChildren() {
  },

  appendChildToContainer: appendChild,

  insertInContainerBefore: insertBefore,

  removeChildFromContainer: removeChild,

  supportsMutation: true,
};
