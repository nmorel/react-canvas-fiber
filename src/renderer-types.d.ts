import { ReactNode } from "react";
import { ViewProps, TextProps, ImageProps } from "./YogaComponents";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "c-view": ViewProps & {
        children?: ReactNode;
      };
      "c-text": TextProps & {
        children?: ReactNode;
      };
      "c-image": ImageProps & {
        children?: ReactNode;
      };
    }
  }
}
