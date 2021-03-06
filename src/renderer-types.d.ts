import { ReactElement } from "react";
import { ImageStyle, TextStyle, ViewStyle } from "./Style";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "c-view": {
        style?: ViewStyle;
        children?: ReactElement;
      };
      "c-text": {
        text: string;
        style?: TextStyle;
        children?: ReactElement;
      };
      "c-image": {
        image: HTMLImageElement;
        style?: ImageStyle;
        children?: ReactElement;
      };
    }
  }
}
