import Reconciler from "react-reconciler";
import {
  unstable_now as now,
  unstable_IdlePriority as idlePriority,
  unstable_runWithPriority as run,
} from "scheduler";
import { CanvasRenderer } from "./CanvasRenderer";
import { Text, View } from "./YogaComponents";

const roots = new Map<CanvasRenderer, Reconciler.FiberRoot>();
const emptyObject = {};
const is = {
  obj: (a: any) => a === Object(a) && !is.arr(a),
  fun: (a: any) => typeof a === "function",
  str: (a: any) => typeof a === "string",
  num: (a: any) => typeof a === "number",
  und: (a: any) => a === void 0,
  arr: (a: any) => Array.isArray(a),
  equ(a: any, b: any) {
    // Wrong type or one of the two undefined, doesn't match
    if (typeof a !== typeof b || !!a !== !!b) return false;
    // Atomic, just compare a against b
    if (is.str(a) || is.num(a) || is.obj(a)) return a === b;
    // Array, shallow compare first to see if it's a match
    if (is.arr(a) && a == b) return true;
    // Last resort, go through keys
    let i;
    for (i in a) if (!(i in b)) return false;
    for (i in b) if (a[i] !== b[i]) return false;
    return is.und(i) ? a === b : true;
  },
};

function appendChild(parentInstance, child) {
  parentInstance.addChild(child);
}

function insertBefore(parentInstance, child, beforeChild) {
  parentInstance.insertChildBefore(child, beforeChild);
}

function removeChild(parentInstance, child) {
  parentInstance.removeChild(child);
}

let Renderer = Reconciler({
  now,
  createInstance(
    type,
    {
      /* filter out children, will be added through appendChild */
      children,
      ...props
    },
    rootContainerInstance,
    hostContext,
    internalInstanceHandle
  ) {
    switch (type) {
      case "view": {
        // @ts-ignore
        return new View(props);
      }
      case "text": {
        // @ts-ignore
        return new Text(props);
      }
      default:
        return null;
    }
  },

  commitUpdate(
    instance: any,
    updatePayload: any,
    type: string,
    oldProps: any,
    newProps: any,
    fiber: Reconciler.Fiber
  ) {
    //   if (instance.__instance && newProps.object && newProps.object !== instance) {
    //     // <instance object={...} /> where the object reference has changed
    //     switchInstance(instance, type, newProps, fiber)
    //   } else {
    //     // This is a data object, let's extract critical information about it
    //     const { args: argsNew = [], ...restNew } = newProps
    //     const { args: argsOld = [], ...restOld } = oldProps
    //     // If it has new props or arguments, then it needs to be re-instanciated
    //     const hasNewArgs = argsNew.some((value: any, index: number) =>
    //       is.obj(value)
    //         ? Object.entries(value).some(([key, val]) => val !== argsOld[index][key])
    //         : value !== argsOld[index]
    //     )
    //     if (hasNewArgs) {
    //       // Next we create a new instance and append it again
    //       switchInstance(instance, type, newProps, fiber)
    //     } else {
    //       // Otherwise just overwrite props
    //       applyProps(instance, restNew, restOld, true)
    //     }
    //   }
  },

  appendChild,
  appendInitialChild: appendChild,
  appendChildToContainer: appendChild,

  insertBefore,
  insertInContainerBefore: insertBefore,

  removeChild,
  removeChildFromContainer: removeChild,

  hideInstance(instance: any) {
    //   if (instance.isObject3D) {
    //     instance.visible = false
    //     invalidateInstance(instance)
    //   }
  },
  unhideInstance(instance: any) {
    //   if ((instance.isObject3D && props.visible == null) || props.visible) {
    //     instance.visible = true
    //     invalidateInstance(instance)
    //   }
  },

  supportsMutation: true,
  supportsPersistence: false,
  supportsHydration: false,
  isPrimaryRenderer: false,

  scheduleTimeout: setTimeout,
  cancelTimeout: clearTimeout,
  noTimeout: -1,
  queueMicrotask:
    typeof window.queueMicrotask !== "function"
      ? window.queueMicrotask
      : (cb) =>
          Promise.resolve()
            .then(cb)
            .catch((e) =>
              setTimeout(() => {
                throw e;
              })
            ),

  getPublicInstance(instance: any) {
    return instance;
  },
  getRootHostContext() {
    return emptyObject;
  },
  getChildHostContext() {
    return emptyObject;
  },
  finalizeInitialChildren(instance: any) {
    // https://github.com/facebook/react/issues/20271
    // Returning true will trigger commitMount
    return instance.__handlers;
  },
  commitMount(instance: any /*, type, props*/) {
    // https://github.com/facebook/react/issues/20271
    // This will make sure events are only added once to the central container
    const container = instance.__container;
    if (container && instance.raycast && instance.__handlers)
      container.__interaction.push(instance);
  },
  prepareUpdate() {
    return emptyObject;
  },
  prepareForCommit() {
    return null;
  },
  preparePortalMount() {
    // noop
  },
  resetAfterCommit(container) {
    container.draw()
  },
  clearContainer() {
    return false;
  },

  // Text operations, should not happen
  createTextInstance() {
    throw new Error(
      "Text is not allowed in the react-canvas-fiber tree. You may have extraneous whitespace between components."
    );
  },
  hideTextInstance() {
    throw new Error(
      "Text is not allowed in the react-canvas-fiber tree. You may have extraneous whitespace between components."
    );
  },
  shouldSetTextContent() {
    return false
  },
});

export function render(
  element: React.ReactNode,
  canvasRenderer: CanvasRenderer
) {
  let root = roots.get(canvasRenderer);
  if (!root) {
    // @ts-ignore
    let newRoot = (root = Renderer.createContainer(
      canvasRenderer,
      /*state !== undefined && state.current.concurrent ? 2 : */ 0,
      false,
      // @ts-ignore
      null
    ));
    roots.set(canvasRenderer, newRoot);
  }
  Renderer.updateContainer(element, root, null, () => undefined);
  return Renderer.getPublicRootInstance(root);
}
