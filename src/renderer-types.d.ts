import React, {
  PointerEvent as ReactPointerEvent,
  ReactNode,
  Ref,
} from "react";
import {
  ViewProps,
  TextProps,
  ImageProps,
  View,
  Image,
  Text,
} from "./YogaComponents";

type CanvasElement<T extends View> = {
  ref?: Ref<T>;
  children?: ReactNode;
} & RCF.Handlers;

declare global {
  namespace RCF {
    type Event<
      NativeEvent extends
        | globalThis.MouseEvent
        | globalThis.PointerEvent
        | globalThis.WheelEvent,
      T extends View = View
    > = Omit<
      NativeEvent,
      | "target"
      | "currentTarget"
      | "eventPhase"
      | "timeStamp"
      | "defaultPrevented"
      | "preventDefault"
      | "stopPropagation"
    > & {
      nativeEvent: NativeEvent;
      target: T;
      currentTarget: T;

      eventPhase: number;

      defaultPrevented: boolean;
      preventDefault(): void;

      isPropagationStopped: boolean;
      stopPropagation(): void;

      timestamp: number;

      canvasX: number;
      canvasY: number;
    };
    type PointerEvent<T extends View = View> = Event<
      globalThis.PointerEvent,
      T
    >;
    type MouseEvent<T extends View = View> = Event<globalThis.MouseEvent, T>;
    type WheelEvent<T extends View = View> = Event<globalThis.WheelEvent, T>;

    type PointerEventType =
      | "onPointerDown"
      | "onPointerMove"
      | "onPointerUp"
      | "onPointerOver";
    type MouseEventType = "onTap" | "onDoubleTap";
    type WheelEventType = "onWheel";
    type EventType = PointerEventType | MouseEventType | WheelEventType;
    type Handlers = {
      [Event in
        | PointerEventType
        | `${PointerEventType}Capture` as `${Event}`]?: <T extends View = View>(
        evt: RCF.PointerEvent<T>
      ) => void;
    } &
      {
        [Event in MouseEventType | `${MouseEventType}Capture` as `${Event}`]?: <
          T extends View = View
        >(
          evt: RCF.MouseEvent<T>
        ) => void;
      } &
      {
        [Event in WheelEventType | `${WheelEventType}Capture` as `${Event}`]?: <
          T extends View = View
        >(
          evt: RCF.WheelEvent<T>
        ) => void;
      };
  }
  namespace JSX {
    interface IntrinsicElements {
      "c-view": ViewProps & CanvasElement<View>;
      "c-text": TextProps & CanvasElement<Text>;
      "c-image": ImageProps & CanvasElement<Image>;
    }
  }
}
