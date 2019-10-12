import ReactReconciler from '../react-reconciler/index.js';
import hostConfig from './hostConfig.js';

const reconciler = ReactReconciler(hostConfig);

export function render(rootElement, container) {
  if (!container._rootContainer) {
    container._rootContainer = reconciler.createContainer(
      container,
      false,
      false
    );
  }

  reconciler.updateContainer(
    rootElement,
    container._rootContainer
  );
}

export * from './nodes.js';

