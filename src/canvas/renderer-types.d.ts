import { ReactNode, Ref } from "react";
import { CanvasRenderer } from "./CanvasRenderer";
import {
  ViewProps,
  TextProps,
  ImageProps,
  View,
  Image,
  Text,
  BaseElement,
  SvgProps,
  Svg,
  SvgPath,
  SvgPathProps,
} from "./YogaComponents";

type CanvasElement<T extends BaseElement> = {
  ref?: Ref<T>;
  children?: ReactNode;
} & RCF.Handlers;

declare global {
  namespace RCF {
    type Target = CanvasRenderer | BaseElement;
    type Event<
      NativeEvent extends
        | globalThis.MouseEvent
        | globalThis.PointerEvent
        | globalThis.WheelEvent
    > = Omit<
      NativeEvent,
      | "type"
      | "target"
      | "currentTarget"
      | "eventPhase"
      | "timeStamp"
      | "defaultPrevented"
      | "preventDefault"
      | "stopPropagation"
    > & {
      nativeEvent: NativeEvent;
      type: string;
      target: Target;
      currentTarget: Target;

      eventPhase: number;

      defaultPrevented: boolean;
      preventDefault(): void;

      isPropagationStopped: boolean;
      stopPropagation(): void;

      timestamp: number;

      canvasX: number;
      canvasY: number;
      pointerX: number;
      pointerY: number;
    };
    type PointerEvent = Event<globalThis.PointerEvent>;
    type MouseEvent = Event<globalThis.MouseEvent>;
    type WheelEvent = Event<globalThis.WheelEvent>;

    type PointerEventType =
      | "onPointerDown"
      | "onPointerMove"
      | "onPointerUp"
      | "onPointerEnter"
      | "onPointerLeave"
      | "onPointerOver"
      | "onPointerOut";
    type MouseEventType = "onTap" | "onDoubleTap";
    type WheelEventType = "onWheel";
    type EventType = PointerEventType | MouseEventType | WheelEventType;
    type Handlers = {
      [Event in
        | PointerEventType
        | `${PointerEventType}Capture` as `${Event}`]?: (
        evt: RCF.PointerEvent
      ) => void;
    } &
      {
        [Event in MouseEventType | `${MouseEventType}Capture` as `${Event}`]?: (
          evt: RCF.MouseEvent
        ) => void;
      } &
      {
        [Event in WheelEventType | `${WheelEventType}Capture` as `${Event}`]?: (
          evt: RCF.WheelEvent
        ) => void;
      };
  }
  namespace JSX {
    interface IntrinsicElements {
      "c-view": ViewProps & CanvasElement<View>;
      "c-text": TextProps & CanvasElement<Text>;
      "c-image": ImageProps & CanvasElement<Image>;
      "c-svg": SvgProps & CanvasElement<Svg>;
      "c-svg-path": SvgPathProps & CanvasElement<SvgPath>;
    }
  }
}
