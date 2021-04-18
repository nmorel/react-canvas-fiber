import { HasChildren } from "./HasChildren";
import { View, ViewProps } from "./YogaComponents";
import { difference, intersection } from "lodash-es";
import { newTextBreaker } from "../utils/text-breaker";
import type { TextBreaker } from "../utils/text-breaker";
import { defaultBounds, identityMatrix } from "../constants/defaultValues";

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

  private bounds = defaultBounds;

  private forcedTarget: RCF.Target | null = null;
  private lastClickEvents: Map<
    RCF.Target,
    { detail: number; timestamp: number }
  > = new Map();
  private lastHoveredTargets: RCF.Target[] = [];

  private assetsLoaded = false;
  private requestingDraw = false;

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

    this.scaleRatio = window.devicePixelRatio || 1;
    this.canvas.width = this.containerWidth * this.scaleRatio;
    this.canvas.height = this.containerHeight * this.scaleRatio;

    this.updateBounds();
  }

  updateTransformMatrix(transformMatrix: typeof identityMatrix) {
    this.props.transformMatrix = transformMatrix;
    this.updateBounds();
    this.requestDraw();
  }

  updateBounds() {
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

  requestDraw() {
    if (!this.requestingDraw) {
      Promise.resolve().then(() => {
        if (this.requestingDraw) {
          this.draw();
        }
      });
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

    this.requestingDraw = false;
    // console.log("drawing canvas");
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

      if (
        child.bounds.width > 0 &&
        child.bounds.height > 0 &&
        child.bounds.right >= this.bounds.left &&
        child.bounds.left <= this.bounds.right &&
        child.bounds.bottom >= this.bounds.top &&
        child.bounds.top <= this.bounds.bottom
      ) {
        child.render(ctx);
      }
    });

    ctx.restore();
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
    const lastHoveredTarget = this.lastHoveredTargets[
      this.lastHoveredTargets.length - 1
    ];
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
        const lastHoveredTarget = this.lastHoveredTargets[
          this.lastHoveredTargets.length - 1
        ];
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

  removeListenersFromView(view: View) {
    this.lastClickEvents.delete(view);
    this.lastHoveredTargets = this.lastHoveredTargets.filter((v) => v !== view);
  }

  dispose() {
    this._addOrRemoveListeners(false);
    this.requestingDraw = false;
  }
}