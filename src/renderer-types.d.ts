import { ReactNode, Ref } from "react";
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
    type PointerEvent = {};
    type Handlers = {
      onPointerDown?(evt: RCF.PointerEvent): void;
      onPointerDownCapture?(evt: RCF.PointerEvent): void;
      onPointerMove?(evt: RCF.PointerEvent): void;
      onPointerMoveCapture?(evt: RCF.PointerEvent): void;
      onPointerUp?(evt: RCF.PointerEvent): void;
      onPointerUpCapture?(evt: RCF.PointerEvent): void;
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
