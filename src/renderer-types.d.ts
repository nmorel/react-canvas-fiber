import { ReactNode } from "react";
import { ImageStyle, TextStyle, ViewStyle } from "./Style";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "c-view": {
        style?: ViewStyle;
        children?: ReactNode;
      };
      "c-text": {
        text: string;
        style?: TextStyle;
        children?: ReactNode;
      };
      "c-image": {
        image: HTMLImageElement;
        style?: ImageStyle;
        children?: ReactNode;
      };
    }
  }
}
