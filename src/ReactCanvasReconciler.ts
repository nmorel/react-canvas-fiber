import Reconciler from "react-reconciler";
import {
  unstable_now as now,
  unstable_IdlePriority as idlePriority,
  unstable_runWithPriority as run,
} from "scheduler";
import { CanvasRenderer } from "./CanvasRenderer";
import { HasChildren } from "./HasChildren";
import { Image, Text, View } from "./YogaComponents";

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

function appendChild(parentInstance: HasChildren | null, child: View<any>) {
  parentInstance?.addChild(child);
}

function insertBefore(
  parentInstance: HasChildren | null,
  child: View<any>,
  beforeChild: View<any>
) {
  parentInstance?.insertChildBefore(child, beforeChild);
}

function removeChild(parentInstance: HasChildren | null, child: View<any>) {
  parentInstance?.removeChild(child);
}

let Renderer = Reconciler({
  now,
  createInstance(type, props, rootContainer, hostContext, internalHandle) {
    switch (type) {
      case "c-view": {
        // @ts-ignore
        return new View(props);
      }
      case "c-text": {
        // @ts-ignore
        return new Text(props);
      }
      case "c-image": {
        // @ts-ignore
        return new Image(props);
      }
      default:
        return null;
    }
  },

  prepareUpdate(
    instance,
    type,
    oldProps,
    newProps,
    rootContainer,
    hostContext
  ) {
    return newProps;
  },
  commitUpdate(
    instance: any,
    updatePayload: any,
    type: string,
    prevProps: any,
    nextProps: any,
    internalHandle: Reconciler.Fiber
  ) {
    instance.update(nextProps);
  },

  appendChild,
  appendInitialChild: appendChild,
  appendChildToContainer: appendChild,

  insertBefore,
  insertInContainerBefore: insertBefore,

  removeChild,
  removeChildFromContainer: removeChild,

  hideInstance(instance) {
    //   if (instance.isObject3D) {
    //     instance.visible = false
    //     invalidateInstance(instance)
    //   }
  },
  unhideInstance(instance) {
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

  getPublicInstance(instance) {
    return instance;
  },
  getRootHostContext(rootContainer) {
    return emptyObject;
  },
  getChildHostContext(parentHostContext, type, rootContainer) {
    return emptyObject;
  },
  finalizeInitialChildren(instance, type, props, rootContainer, hostContext) {
    return false;
  },
  commitMount(instance, type, props, internalInstanceHandle) {
    // https://github.com/facebook/react/issues/20271
    // This will make sure events are only added once to the central container
    // const container = instance.__container;
    // if (container && instance.raycast && instance.__handlers)
    //   container.__interaction.push(instance);
  },
  prepareForCommit(container) {
    return null;
  },
  preparePortalMount(container) {
    // noop
  },
  resetAfterCommit(container) {
    // @ts-ignore
    container?.draw();
  },
  clearContainer(container) {
    // noop
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
    return false;
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
