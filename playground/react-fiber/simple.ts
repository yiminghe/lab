interface Fiber {
  child?: Fiber;
  sibling?: Fiber;
  return?: Fiber;
  name: string;
}

let workInProgress: Fiber | undefined;
let yieldAfter: number = 0;
const TIME_SLICE = 500;

function now(): number {
  return Date.now();
}

function shouldYield(): boolean {
  return now() >= yieldAfter;
}

function performWork(root?: Fiber) {
  if (root) {
    workInProgress = root;
  }

  if (!workInProgress) {
    return;
  }

  yieldAfter = now() + TIME_SLICE;
  do {
    const current = workInProgress;
    workInProgress = performUnitOfWork(current);
  } while (workInProgress && !shouldYield());

  if (workInProgress) {
    console.log('yielding at', workInProgress.name, 'resuming later');
    setTimeout(performWork, 0);
  }
}

function performUnitOfWork(unitOfWork: Fiber): Fiber | undefined {
  const next = beginWork(unitOfWork);
  if (next) {
    return next;
  }
  return completeUnitOfWork(unitOfWork);
}

function beginWork(unitOfWork: Fiber): Fiber | undefined {
  console.log('beginWork', unitOfWork.name);
  return unitOfWork.child;
}

function completeUnitOfWork(unitOfWork: Fiber): Fiber | undefined {
  let completedWork: Fiber | undefined = unitOfWork;
  while (completedWork) {
    completeWork(completedWork);
    const sibling = completedWork.sibling;
    if (sibling) {
      return sibling;
    }
    completedWork = completedWork.return;
  }
  return undefined;
}

function completeWork(unitOfWork: Fiber) {
  console.log('completeWork', unitOfWork.name);
}

const fiberRoot: Fiber = { name: 'root' };
const a: Fiber = { name: 'a', return: fiberRoot };
const b: Fiber = { name: 'b', return: fiberRoot };
const a1: Fiber = { name: 'a1', return: a };
const a2: Fiber = { name: 'a2', return: a };

fiberRoot.child = a;
a.sibling = b;
a.child = a1;
a1.sibling = a2;

performWork(fiberRoot);
