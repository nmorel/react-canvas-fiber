import { HasChildren } from "./HasChildren";
import { View, ViewProps } from "./YogaComponents";
import { difference, intersection, debounce } from "lodash-es";
import { newTextBreaker } from "../utils/text-breaker";
import type { TextBreaker } from "../utils/text-breaker";
import { defaultBounds, identityMatrix } from "../constants/defaultValues";
import { createOffscreenCanvas } from "@react-canvas/create-offscreen-canvas";

function mergeBounds(...bounds: Array<typeof defaultBounds>) {
  let left = +Infinity;
  let top = +Infinity;
  let right = -Infinity;
  let bottom = -Infinity;

  bounds.forEach((bound) => {
    if (!bound.width || !bound.height) return;

    left = Math.min(bound.left, left);
    top = Math.min(bound.top, top);
    right = Math.max(bound.right, right);
    bottom = Math.max(bound.bottom, bottom);
  });

  if (!Number.isFinite(left)) {
    return defaultBounds;
  }

  return {
    left,
    top,
    right,
    bottom,
    width: right - left,
    height: bottom - top,
  };
}

export class CanvasRenderer extends HasChildren {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  containerWidth = 0;
  containerHeight = 0;
  scaleRatio = 1;
  textBreaker: TextBreaker | null = null;

  props: {
    transformMatrix: typeof identityMatrix;
    width: number;
    height: number;
  } & RCF.Handlers;

  private prevTransformMatrix: typeof identityMatrix = identityMatrix;
  private prevBounds = defaultBounds;
  private bounds = defaultBounds;

  private forcedTarget: RCF.Target | null = null;
  private lastClickEvents: Map<
    RCF.Target,
    { detail: number; timestamp: number }
  > = new Map();
  private lastHoveredTargets: RCF.Target[] = [];

  private assetsLoaded = false;
  private requestingDraw = false;
  private redrawReasons = new Map<"full" | "vpt" | "child", Set<View> | null>();

  constructor(canvas: HTMLCanvasElement, props: CanvasRenderer["props"]) {
    super();

    this.canvas = canvas;
    this.props = props;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) {
      throw new Error(`Can't create a 2d context on canvas`);
    }
    this.context = context;
    this.updateDimensions();
    this._addOrRemoveListeners(true);

    newTextBreaker().then((textBreaker) => {
      this.textBreaker = textBreaker;
      this.assetsLoaded = true;
      if (this.requestingDraw) {
        this.draw();
      }
    });
  }

  updateDimensions() {
    const { width, height } = this.props;
    this.containerWidth = width;
    this.containerHeight = height;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.scaleRatio = 1; // window.devicePixelRatio || 1;
    this.canvas.width = this.containerWidth * this.scaleRatio;
    this.canvas.height = this.containerHeight * this.scaleRatio;

    this._updateBounds();
    this.requestDraw();
  }

  updateTransformMatrix(transformMatrix: typeof identityMatrix) {
    this.prevTransformMatrix = this.props.transformMatrix;
    this.props.transformMatrix = transformMatrix;
    this._updateBounds();
    this.requestDraw("vpt");
  }

  _updateBounds() {
    this.prevBounds = this.bounds;

    const left = -this.props.transformMatrix[4] / this.props.transformMatrix[0];
    const top = -this.props.transformMatrix[5] / this.props.transformMatrix[3];
    const right = left + this.props.width / this.props.transformMatrix[0];
    const bottom = top + this.props.height / this.props.transformMatrix[3];
    this.bounds = {
      left,
      top,
      right,
      bottom,
      width: right - left,
      height: bottom - top,
    };
  }

  debouncedFullRedraw = debounce(() => this.requestDraw(), 500);

  requestDraw(): void;
  requestDraw(reason: "vpt"): void;
  requestDraw(reason: "child", child: View): void;
  requestDraw(reason: "full" | "vpt" | "child" = "full", child?: View): void {
    if (!this.requestingDraw) {
      Promise.resolve().then(() => {
        if (this.requestingDraw) {
          this.draw();
        }
      });
    }
    if (reason === "child") {
      let prevChilds = this.redrawReasons.get("child");
      if (!prevChilds) {
        prevChilds = new Set();
        this.redrawReasons.set("child", prevChilds);
      }
      prevChilds.add(child!);
    } else {
      this.redrawReasons.set(reason, null);
      if (reason === "full") {
        this.debouncedFullRedraw.cancel();
      }
    }
    this.requestingDraw = true;
  }

  forceEventsTarget(target: RCF.Target | null) {
    this.forcedTarget = target;
  }

  private draw() {
    if (!this.assetsLoaded) {
      return;
    }

    if (this.redrawReasons.has("full")) {
      // Full redraw
      this.fullDraw();
    } else {
      // Partial redraw
      this.partialDraw(this.redrawReasons.get("child"));
    }
    this.requestingDraw = false;
    this.redrawReasons.clear();
  }

  private fullDraw() {
    this.bufferCanvas = null;
    this.bufferContext = null;

    const ctx = this.context;
    ctx.clearRect(
      0,
      0,
      this.containerWidth * this.scaleRatio,
      this.containerHeight * this.scaleRatio
    );

    ctx.save();
    ctx.setTransform(...this.props.transformMatrix);

    this.children.forEach((child) => {
      child.recomputeLayoutIfDirty();
      if (this.isChildVisible(child, this.bounds)) {
        child.render(ctx);
      }
    });

    ctx.restore();
  }

  private bufferCanvas: OffscreenCanvas | HTMLCanvasElement | null = null;
  private bufferContext:
    | OffscreenCanvasRenderingContext2D
    | CanvasRenderingContext2D
    | null = null;

  private partialDraw(childsToRedraw?: Set<View> | null) {
    // Draw previous content into buffer at current vpt transform
    const { width, height, transformMatrix } = this.props;
    const { prevTransformMatrix, bounds, prevBounds } = this;
    if (this.bufferCanvas && this.bufferContext) {
      this.bufferContext.clearRect(0, 0, width, height);
    } else {
      this.bufferCanvas = createOffscreenCanvas(width, height);
      this.bufferContext = this.bufferCanvas.getContext("2d", { alpha: true })!;
    }

    this.bufferContext.save();

    this.bufferContext.setTransform(...transformMatrix);

    const boundsToRedraw = childsToRedraw
      ? mergeBounds(
          ...[...childsToRedraw]
            .map((child) => {
              const prevBounds = child.bounds;
              child.recomputeLayoutIfDirty();
              return [prevBounds, child.bounds];
            })
            .flat()
        )
      : null;

    this.children.forEach((child) => {
      child.recomputeLayoutIfDirty();
      if (
        childsToRedraw?.has(child) ||
        (boundsToRedraw && this.isChildVisible(child, boundsToRedraw)) ||
        (prevBounds !== bounds &&
          !this.isChildInside(child, prevBounds) &&
          this.isChildVisible(child, bounds))
      ) {
        child.render(this.bufferContext!);
      }
    });

    const diffScale = transformMatrix[0] / prevTransformMatrix[0];
    if (diffScale !== 1) {
      this.debouncedFullRedraw();
    }
    this.bufferContext.setTransform(
      diffScale,
      0,
      0,
      diffScale,
      transformMatrix[4] - prevTransformMatrix[4] * diffScale,
      transformMatrix[5] - prevTransformMatrix[5] * diffScale
    );
    if (boundsToRedraw) {
      const tl = this._transformPoint(
        { x: boundsToRedraw.left, y: boundsToRedraw.top },
        transformMatrix
      );
      tl.x = Math.max(0, tl.x);
      tl.y = Math.max(0, tl.y);
      const br = this._transformPoint(
        { x: boundsToRedraw.right, y: boundsToRedraw.bottom },
        transformMatrix
      );
      br.x = Math.min(width, br.x);
      br.y = Math.min(height, br.y);

      // Have to clear the bufferContext around the boundsToRedraw
      this.bufferContext.clearRect(0, 0, tl.x, height);
      this.bufferContext.clearRect(0, 0, width, tl.y);
      this.bufferContext.clearRect(br.x, 0, width, height);
      this.bufferContext.clearRect(0, br.y, width, height);
      // Have to clear the context of the boundsToRedraw
      this.context.clearRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
    } else {
      this.bufferContext.clearRect(0, 0, width, height);
    }
    this.bufferContext.drawImage(
      this.canvas,
      0,
      0,
      width,
      height,
      0,
      0,
      width,
      height
    );

    this.context.clearRect(0, 0, width, height);
    this.context.drawImage(
      this.bufferCanvas,
      0,
      0,
      width,
      height,
      0,
      0,
      width,
      height
    );

    this.bufferContext.restore();
    this.bufferContext.clearRect(0, 0, width, height);

    this.prevTransformMatrix = this.props.transformMatrix;
    this.prevBounds = this.bounds;
  }

  private isChildVisible(child: View, bounds: typeof defaultBounds) {
    return (
      child.bounds.width > 0 &&
      child.bounds.height > 0 &&
      child.bounds.right >= bounds.left &&
      child.bounds.left <= bounds.right &&
      child.bounds.bottom >= bounds.top &&
      child.bounds.top <= bounds.bottom
    );
  }

  private isChildInside(child: View, bounds: typeof defaultBounds) {
    return (
      child.bounds.width > 0 &&
      child.bounds.height > 0 &&
      child.bounds.right <= bounds.right &&
      child.bounds.left >= bounds.left &&
      child.bounds.bottom <= bounds.bottom &&
      child.bounds.top >= bounds.top
    );
  }

  _onPointerDown = (evt: PointerEvent) => {
    this._handleEvent(evt, "onPointerDown");
  };

  _onPointerMove = (evt: PointerEvent) => {
    this._handleEvent(evt, "onPointerMove");
  };

  _onPointerOver = (evt: PointerEvent) => {
    this._handleEvent(evt, "onPointerOver");
  };

  _onPointerUp = (evt: PointerEvent) => {
    this._handleEvent(evt, "onPointerUp");
  };

  _onPointerLeave = (evt: PointerEvent) => {
    if (!this.lastHoveredTargets.length || this.forcedTarget) {
      return;
    }

    const pointer = this._convertEvtPointer(evt);
    const transformedPointer = this._convertPointerToCanvasCoordinates(pointer);
    const lastHoveredTarget =
      this.lastHoveredTargets[this.lastHoveredTargets.length - 1];
    let customEvent = this._createEvent(
      evt,
      lastHoveredTarget,
      pointer,
      transformedPointer
    );
    customEvent.type = "pointerout";
    this._callHandlers(this.lastHoveredTargets, customEvent, "onPointerOut");
    this.lastHoveredTargets = [];
  };

  _onClick = (evt: MouseEvent) => {
    this._handleEvent(evt, "onTap");
  };

  _onWheel = (evt: WheelEvent) => {
    this._handleEvent(evt, "onWheel");
  };

  _onContextMenu = (evt: MouseEvent) => {
    evt.stopPropagation();
    evt.preventDefault();
  };

  _addOrRemoveListeners(add: boolean) {
    let fn = add
      ? this.canvas.addEventListener
      : this.canvas.removeEventListener;
    fn("pointerdown", this._onPointerDown);
    fn("pointermove", this._onPointerMove);
    fn("pointerup", this._onPointerUp);
    fn("pointerleave", this._onPointerLeave);
    fn("wheel", this._onWheel);
    fn("click", this._onClick);
    fn("contextmenu", this._onContextMenu);
  }

  _handleEvent(evt: MouseEvent, eventName: RCF.MouseEventType): void;
  _handleEvent(evt: PointerEvent, eventName: RCF.PointerEventType): void;
  _handleEvent(evt: WheelEvent, eventName: RCF.WheelEventType): void;
  _handleEvent<Event extends MouseEvent | PointerEvent | WheelEvent>(
    evt: Event,
    eventName: RCF.EventType
  ): void {
    const pointer = this._convertEvtPointer(evt);
    const transformedPointer = this._convertPointerToCanvasCoordinates(pointer);

    const forcedTarget =
      this.forcedTarget || (eventName === "onWheel" ? this : null);

    let targets: RCF.Target[];
    if (forcedTarget) {
      targets = [forcedTarget];
    } else {
      targets = [this];
      for (let i = this.children.length - 1; i >= 0; i--) {
        if (
          this._findTargetOnView(this.children[i], transformedPointer, targets)
        ) {
          break;
        }
      }
    }

    if (
      !forcedTarget &&
      (eventName === "onPointerMove" || eventName === "onPointerDown")
    ) {
      // pointerout
      if (
        this.lastHoveredTargets.length &&
        (this.lastHoveredTargets.length !== targets.length ||
          intersection(this.lastHoveredTargets, targets).length !==
            this.lastHoveredTargets.length)
      ) {
        const lastHoveredTarget =
          this.lastHoveredTargets[this.lastHoveredTargets.length - 1];
        let customEvent = this._createEvent(
          evt,
          lastHoveredTarget,
          pointer,
          transformedPointer
        );
        customEvent.type = "pointerout";
        this._callHandlers(
          this.lastHoveredTargets,
          customEvent,
          "onPointerOut"
        );
      }

      // pointerleave
      const targetsNoLongerHovered = difference(
        this.lastHoveredTargets,
        targets
      );
      if (targetsNoLongerHovered.length) {
        let customEvent = this._createEvent(
          evt,
          targetsNoLongerHovered[targetsNoLongerHovered.length - 1],
          pointer,
          transformedPointer
        );
        customEvent.type = "pointerleave";
        targetsNoLongerHovered.reverse();
        this._callHandlers(
          targetsNoLongerHovered,
          customEvent,
          "onPointerLeave",
          false
        );
      }

      // pointerenter
      const targetsNewlyHovered = difference(targets, this.lastHoveredTargets);
      if (targetsNewlyHovered.length) {
        let customEvent = this._createEvent(
          evt,
          targetsNewlyHovered[targetsNewlyHovered.length - 1],
          pointer,
          transformedPointer
        );
        customEvent.type = "pointerenter";
        this._callHandlers(
          targetsNewlyHovered,
          customEvent,
          "onPointerEnter",
          false
        );
      }

      // pointerover
      if (targets.length) {
        const newHoveredTarget = targets[targets.length - 1];
        let customEvent = this._createEvent(
          evt,
          newHoveredTarget,
          pointer,
          transformedPointer
        );
        customEvent.type = "pointerover";
        this._callHandlers(targets, customEvent, "onPointerOver");
      }

      this.lastHoveredTargets = targets;
    }

    const target = targets[targets.length - 1];

    let customEvent = this._createEvent(
      evt,
      target,
      pointer,
      transformedPointer
    );

    let doubleTapTargets: RCF.Target[] | undefined;
    if (eventName === "onTap") {
      doubleTapTargets = [];
      for (const target of targets) {
        let entry = this.lastClickEvents.get(target);
        if (!entry) {
          entry = {
            detail: 0,
            timestamp: 0,
          };
          this.lastClickEvents.set(target, entry);
        } else if (customEvent.timestamp - entry.timestamp > 400) {
          entry.detail = 0;
        }
        entry.detail++;
        entry.timestamp = customEvent.timestamp;
        if (entry.detail === 2) {
          doubleTapTargets.push(target);
        }
      }
    }

    this._callHandlers(targets, customEvent, eventName);

    if (doubleTapTargets?.length) {
      customEvent = this._createEvent(evt, target, pointer, transformedPointer);
      customEvent.type = "dblclick";
      this._callHandlers(doubleTapTargets, customEvent, "onDoubleTap");
    }
  }

  _convertEvtPointer<Event extends PointerEvent | MouseEvent | WheelEvent>(
    evt: Event
  ) {
    const { left, top } = this.canvas.getBoundingClientRect();
    return {
      x: evt.clientX - left,
      y: evt.clientY - top,
    };
  }

  _convertPointerToCanvasCoordinates({ x, y }: { x: number; y: number }) {
    const invertedScale = 1 / this.props.transformMatrix[0];
    return {
      x: invertedScale * x - this.props.transformMatrix[4] * invertedScale,
      y: invertedScale * y - this.props.transformMatrix[5] * invertedScale,
    };
  }

  _createEvent<Event extends PointerEvent | MouseEvent | WheelEvent>(
    evt: Event,
    target: RCF.Target,
    pointer: { x: number; y: number },
    transformedPointer: { x: number; y: number }
  ): RCF.Event<Event> {
    const {
      type,
      target: nativeTarget,
      currentTarget,
      eventPhase,
      defaultPrevented,
      preventDefault,
      stopPropagation,
      timeStamp,
      ...evtProps
    } = evt;
    return {
      ...evtProps,
      type,
      timestamp: performance.now(),
      nativeEvent: evt,
      target,
      currentTarget: target,
      eventPhase: 0,
      get defaultPrevented() {
        return evt.defaultPrevented;
      },
      preventDefault() {
        evt.preventDefault();
      },
      isPropagationStopped: false,
      stopPropagation() {
        this.isPropagationStopped = true;
      },
      canvasX: pointer.x,
      canvasY: pointer.y,
      pointerX: transformedPointer.x,
      pointerY: transformedPointer.y,
    };
  }

  _callHandlers(
    targets: RCF.Target[],
    customEvent: RCF.Event<any>,
    eventName: RCF.EventType,
    bubbles = true
  ) {
    if (!bubbles) {
      customEvent.eventPhase = 3;
      for (const view of targets) {
        const handler = view.props[eventName] as (
          evt: typeof customEvent
        ) => void | undefined;
        if (handler) {
          customEvent.currentTarget = view;
          customEvent.detail =
            eventName === "onTap"
              ? this.lastClickEvents.get(view)?.detail || 1
              : eventName === "onDoubleTap"
              ? 2
              : 0;
          handler(customEvent);
          if (customEvent.isPropagationStopped) {
            break;
          }
        }
      }
      return;
    }

    // Capture phase
    customEvent.eventPhase = 1;
    for (const view of targets) {
      const handler = view.props[`${eventName}Capture` as const] as (
        evt: typeof customEvent
      ) => void | undefined;
      if (handler) {
        customEvent.currentTarget = view;
        customEvent.detail =
          eventName === "onTap"
            ? this.lastClickEvents.get(view)?.detail || 1
            : eventName === "onDoubleTap"
            ? 2
            : 0;
        handler(customEvent);
        if (customEvent.isPropagationStopped) {
          break;
        }
      }
    }
    if (customEvent.isPropagationStopped) {
      return;
    }
    // Bubbling phase
    customEvent.eventPhase = 3;
    for (let i = targets.length - 1; i >= 0; i--) {
      const view = targets[i];
      const handler = view.props[eventName] as (
        evt: typeof customEvent
      ) => void | undefined;
      if (handler) {
        customEvent.currentTarget = view;
        customEvent.detail =
          eventName === "onTap"
            ? this.lastClickEvents.get(view)?.detail || 1
            : eventName === "onDoubleTap"
            ? 2
            : 0;
        handler(customEvent);
        if (customEvent.isPropagationStopped) {
          break;
        }
      }
    }
  }

  _findTargetOnView(
    view: View,
    pointer: { x: number; y: number },
    targets: RCF.Target[]
  ): boolean {
    pointer = this._normalizePoint(pointer, view.props.transformMatrix);
    if (
      pointer.x < view.node.getComputedLeft() ||
      pointer.x > view.node.getComputedLeft() + view.node.getComputedWidth() ||
      pointer.y < view.node.getComputedTop() ||
      pointer.y > view.node.getComputedTop() + view.node.getComputedHeight()
    ) {
      return false;
    }

    targets.push(view);
    for (let i = view.children.length - 1; i >= 0; i--) {
      if (this._findTargetOnView(view.children[i], pointer, targets)) {
        break;
      }
    }
    return true;
  }

  _normalizePoint(
    pointer: { x: number; y: number },
    matrix: ViewProps["transformMatrix"]
  ) {
    if (!matrix) return pointer;

    const { x, y } = pointer;
    const [a, b, c, d, tx, ty] = matrix;
    const id = 1 / (a * d + c * -b);
    return {
      x: d * id * x + -c * id * y + (ty * c - tx * d) * id,
      y: a * id * y + -b * id * x + (-ty * a + tx * b) * id,
    };
  }

  _transformPoint(
    p: { x: number; y: number },
    t: ViewProps["transformMatrix"]
  ): { x: number; y: number } {
    if (!t) return p;

    return {
      x: t[0] * p.x + t[2] * p.y + t[4],
      y: t[1] * p.x + t[3] * p.y + t[5],
    };
  }

  removeListenersFromView(view: View) {
    this.lastClickEvents.delete(view);
    this.lastHoveredTargets = this.lastHoveredTargets.filter((v) => v !== view);
  }

  dispose() {
    this._addOrRemoveListeners(false);
    this.debouncedFullRedraw.cancel();
    this.requestingDraw = false;
  }
}
