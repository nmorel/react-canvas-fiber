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
    type PointerEvent<T extends View = View> = {
      nativeEvent: globalThis.PointerEvent;
      target: T;
      currentTarget: T;
      bubbles: boolean;
      cancelable: boolean;
      eventPhase: 0 | 1 | 2 | 3;
      isTrusted: boolean;
      defaultPrevented: boolean;
      preventDefault(): void;
      isPropagationStopped: boolean;
      stopPropagation(): void;
      timeStamp: number;
      type: string;
      altKey: boolean;
      button: number;
      buttons: number;
      clientX: number;
      clientY: number;
      ctrlKey: boolean;
      metaKey: boolean;
      movementX: number;
      movementY: number;
      pageX: number;
      pageY: number;
      screenX: number;
      screenY: number;
      shiftKey: boolean;
      pointerId: number;
      pressure: number;
      tangentialPressure: number;
      tiltX: number;
      tiltY: number;
      twist: number;
      width: number;
      height: number;
      pointerType: "mouse" | "pen" | "touch";
      isPrimary: boolean;

      canvasX: number;
      canvasY: number;
    };
    type EventType =
      | "onPointerDown"
      | "onPointerMove"
      | "onPointerUp"
      | "onTap"
      | "onDoubleTap";
    type HandlerNames = EventType | `${EventType}Capture`;
    type Handlers = {
      [Event in HandlerNames as `${Event}`]?: <T extends View = View>(
        evt: RCF.PointerEvent<T>
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
