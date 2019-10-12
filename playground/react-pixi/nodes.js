import { PIXI_NODE } from "./types.js";

function SimpleNodeFactory(props) {
  return props.value;
}

export function SimpleNode(props) {
  return React.createElement(PIXI_NODE, {
    pixiFactory: SimpleNodeFactory,
    ...props,
  });
}

function SpriteFactory(props) {
  return new PIXI.Sprite(props.texture);
}

function SpriteInit(inst, props, oldProps) {
  if (oldProps) {
    if (props.texture) {
      inst.texture = (props.texture);
    }
  }

  if (props.onTouchStart) {
    if (oldProps && oldProps.onTouchStart) {
      inst.removeListener('touchstart', oldProps.onTouchStart);
    }
    inst.on('touchstart', props.onTouchStart);
  }

  if (props.onTouchEnd) {
    if (oldProps && oldProps.onTouchEnd) {
      inst.removeListener('touchend', oldProps.onTouchEnd);
    }
    inst.on('touchend', props.onTouchEnd);
  }

  if (props.onMouseDown) {
    if (oldProps && oldProps.onMouseDown) {
      inst.removeListener('mousedown', oldProps.onMouseDown);
    }
    inst.on('mousedown', props.onMouseDown);
  }

  if (props.onMouseUp) {
    if (oldProps && oldProps.onMouseUp) {
      inst.removeListener('mouseup', oldProps.onMouseUp);
    }
    inst.on('mouseup', props.onMouseUp);
  }

  if (props.onTouchEnd) {
    if (oldProps && oldProps.onTouchEnd) {
      inst.removeListener('touchend', oldProps.onTouchEnd);
    }
    inst.on('touchend', props.onTouchEnd);
  }

  if ('interactive' in props) {
    inst.interactive = props.interactive;
  }

  if ('anchorX' in props) {
    inst.anchor.x = props.anchorX;
  }
  if ('anchorY' in props) {
    inst.anchor.y = props.anchorY;
  }
  if ('x' in props) {
    inst.position.x = props.x;
  }
  if ('y' in props) {
    inst.position.y = props.y;
  }

  if ('scaleX' in props) {
    inst.scale.x = props.scaleX;
  }
  if ('scaleY' in props) {
    inst.scale.y = props.scaleY;
  }

  if ('rotation' in props) {
    inst.rotation = props.rotation;
  }
}

function SpriteUpdate(inst, newProps, oldProps) {
  const diff = {};
  Object.keys(newProps).forEach(k => {
    if (newProps[k] !== oldProps[k]) {
      diff[k] = newProps[k];
    }
  });
  SpriteInit(inst, diff, oldProps);
}

export function Sprite(props) {
  return React.createElement(PIXI_NODE, {
    pixiFactory: SpriteFactory,
    pixiInit: SpriteInit,
    pixiUpdate: SpriteUpdate,
    ...props,
  });
}
